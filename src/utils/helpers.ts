import fs from 'fs'
import path from 'path'
import axios from 'axios'
import User from '../models/user'
import { Interaction } from 'discord.js'
import Player from '../models/player'
import Game from '../models/game'
import doEmbed from '../embeds'
import Asset from '../models/asset'
import { games } from '..'
import embeds from '../constants/embeds'
import { collections } from '../database/database.service'
import { WithId } from 'mongodb'

export const wait = async (duration: number) => {
  await new Promise((res) => {
    setTimeout(res, duration)
  })
}

export const asyncForEach = async (array: Array<any>, callback: Function) => {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array)
  }
}

const ipfsGateway = process.env.IPFS_GATEWAY || 'https://dweb.link/ipfs/'

export const downloadFile = async (
  asset: Asset,
  directory: string,
  username: string
): Promise<string | void> => {
  try {
    const { assetUrl } = asset
    if (assetUrl) {
      const url = normalizeIpfsUrl(assetUrl) as string
      const path = `${directory}/${username
        .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, '')
        .trim()}.jpg`
      const writer = fs.createWriteStream(path)
      const res = await axios.get(url, {
        responseType: 'stream',
      })
      res.data.pipe(writer)

      return new Promise((resolve, reject) => {
        writer.on('finish', () => {
          return resolve(path)
        })
        writer.on('error', (err) => console.log(err))
      })
    }
  } catch (error) {
    console.log('ERROR:', error)
  }
}

export const mapPlayersForEmbed = (
  playerArr: Player[],
  type: string
): { name: string; value: string }[] =>
  playerArr.map((player) => {
    let value
    if (player.dead || player.hp <= 0) {
      value = '💀'
    } else {
      value =
        type === 'game'
          ? `HP: ${player.hp}`
          : `${player.asset.alias || player.asset.assetName}`
    }
    return {
      name: player.username,
      value,
    }
  })

export const emptyDir = (channelId: string): void => {
  try {
    const dirContents = fs.readdirSync(`dist/nftAssets/`)
    dirContents.forEach((filePath) => {
      const fullPath = path.join(`dist/nftAssets/${channelId}`, filePath)
      const stat = fs.statSync(fullPath)
      if (stat.isDirectory()) {
        if (fs.readdirSync(fullPath).length) emptyDir(fullPath)
        fs.rmdirSync(fullPath)
      } else fs.unlinkSync(fullPath)
    })
  } catch (error) {
    console.log('****** ERROR DELETING IMAGE DIR ******', error)
  }
}

export const addRole = async (
  interaction: Interaction,
  roleId: string,
  user: User
): Promise<void> => {
  try {
    const role = interaction.guild?.roles.cache.find(
      (role) => role.id === roleId
    )
    const member = interaction.guild?.members.cache.find(
      (member) => member.id === user.discordId
    )
    role && (await member?.roles.add(role.id))
  } catch (error) {
    console.log('****** ERROR ADDING ROLE ******', error)
  }
}

export const removeRole = async (
  interaction: Interaction,
  roleId: string,
  discordId: string
): Promise<void> => {
  try {
    const role = interaction.guild?.roles.cache.find(
      (role) => role.id === roleId
    )
    const member = interaction.guild?.members.cache.find(
      (member) => member.id === discordId
    )
    role && (await member?.roles.remove(role.id))
  } catch (error) {
    console.log('****** ERROR DELETING ROLE ******', error)
  }
}

export const confirmRole = (
  roleId: string,
  interaction: Interaction,
  discordId: string
): boolean | undefined => {
  const member = interaction.guild?.members.cache.find(
    (member) => member.id === discordId
  )
  return member?.roles.cache.has(roleId)
}

export const getNumberSuffix = (num: number): string => {
  if (num === 1) return '1st'
  if (num === 2) return '2nd'
  if (num === 3) return '3rd'
  else return `${num}th`
}

export const getPlayerArray = (players: { [key: string]: Player }): Player[] =>
  Object.values(players)

export const randomNumber = (min: number, max: number): number =>
  Math.floor(Math.random() * (max - min) + min)

export const getWinningPlayer = (playerArr: Player[]): Player | undefined => {
  const activePlayers = playerArr.filter((player) => !player.dead)

  return activePlayers.length === 1 ? activePlayers[0] : undefined
}

export const randomSort = (arr: any[]): any[] => {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * i)
    const k = arr[i]
    arr[i] = arr[j]
    arr[j] = k
  }
  return arr
}

export const resetGame = (
  stopped: boolean = false,
  channelId: string
): void => {
  const game = games[channelId]
  game.players = {}
  game.active = false
  game.win = false
  game.waitingRoom = false
  game.attackEngaged = false
  game.stopped = false
  game.megatron = undefined

  if (stopped) {
    game.stopped = true
    stopped && game?.embed?.edit(doEmbed(embeds.stopped, channelId))
  }
}

export const doDamage = (damageRange: number): number => {
  return Math.floor(Math.random() * damageRange)
}

export const getUsersFromPlayers = async (
  players: Player[]
): Promise<User[]> => {
  const users: User[] = []
  await asyncForEach(players, async (player: Player) => {
    const user = (await collections.users.findOne({
      discordId: player.discordId,
    })) as WithId<User>
    users.push(user)
  })
  return users
}

export const isIpfs = (url: string): boolean => url?.slice(0, 4) === 'ipfs'

export const normalizeIpfsUrl = (url: string): string => {
  if (isIpfs(url)) {
    const ifpsHash = url.slice(7)
    return `${ipfsGateway}${ifpsHash}`
  } else {
    return url
  }
}

export const updateGame = (channelId: string) => {
  const game = games[channelId]
  game.update = true
  setTimeout(() => {
    game.update = false
  }, 3000)
}

export const checkIfRegisteredPlayer = (
  games: { [key: string]: Game },
  assetId: string,
  discordId: string
) => {
  let gameCount = 0
  const gameArray = Object.values(games)
  gameArray.forEach((game: Game) => {
    if (game.players[discordId]?.asset?.assetId === Number(assetId)) gameCount++
  })
  return gameCount >= 1
}
