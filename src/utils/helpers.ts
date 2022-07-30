import fs from 'fs'
import path from 'path'
import axios from 'axios'
import User from '../models/user'
import { Interaction } from 'discord.js'
import Player from '../models/player'
import doEmbed from '../embeds'
import Asset from '../models/asset'
import settings from '../settings'
import { game } from '..'
import embeds from '../constants/embeds'
import { collections } from '../database/database.service'
import { WithId } from 'mongodb'

const { damagePerAowl, hp, damageRange } = settings

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
      const path = `${directory}/${username.replace(' ', '')}.jpg`
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

// export const normalizeLink = (imageUrl: string): string => {
//   if (imageUrl?.slice(0, 4) === 'ipfs') {
//     const ifpsHash = imageUrl.slice(7)
//     imageUrl = `${ipfsGateway}${ifpsHash}`
//   }
//   return imageUrl
// }

export const mapPlayersForEmbed = (
  playerArr: Player[],
  type: string
): { name: string; value: string }[] =>
  playerArr.map((player) => {
    let value
    if (player.dead || player.hp <= 0) {
      value = '💀'
    } else {
      value = type === 'game' ? `HP: ${player.hp}` : `${player.asset.assetName}`
    }
    return {
      name: player.username,
      value,
    }
  })

export const emptyDir = (dirPath: string): void => {
  try {
    const dirContents = fs.readdirSync(dirPath)
    dirContents.forEach((filePath) => {
      const fullPath = path.join(dirPath, filePath)
      const stat = fs.statSync(fullPath)
      if (stat.isDirectory()) {
        if (fs.readdirSync(fullPath).length) emptyDir(fullPath)
        fs.rmdirSync(fullPath)
      } else fs.unlinkSync(fullPath)
    })
  } catch (error) {
    console.log('Error deleting contents of image directory', error)
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
    console.log('Error adding role', error)
  }
}

export const removeRole = async (
  interaction: Interaction,
  roleId: string,
  discordId: string
): Promise<void> => {
  const role = interaction.guild?.roles.cache.find((role) => role.id === roleId)
  const member = interaction.guild?.members.cache.find(
    (member) => member.id === discordId
  )
  role && (await member?.roles.remove(role.id))
}

export const confirmRole = async (
  roleId: string,
  interaction: Interaction,
  userId: string
): Promise<boolean | undefined> => {
  const member = interaction.guild?.members.cache.find(
    (member) => member.id === userId
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

export const getWinningPlayer = (
  playerArr: Player[]
): { winningPlayer: Player | undefined; winByTimeout: boolean } => {
  const activePlayers = playerArr.filter(
    (player) => !player.timedOut && !player.dead
  )

  let winByTimeout = false

  const timedOutPlayers = playerArr.filter((player) => player.timedOut)

  if (timedOutPlayers.length === playerArr.length - 1) {
    winByTimeout = true
  }

  return activePlayers.length === 1
    ? { winningPlayer: activePlayers[0], winByTimeout }
    : { winningPlayer: undefined, winByTimeout: false }
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

export const resetGame = (stopped: boolean = false): void => {
  game.players = {}
  game.active = false
  game.win = false
  game.waitingRoom = false
  game.attackEngaged = false
  game.stopped = false

  if (stopped) {
    game.stopped = true
    stopped && game?.embed?.edit(doEmbed(embeds.stopped))
  }
}

export const doDamage = (
  player: Player,
  withMultiplier: boolean = false
): number => {
  if (withMultiplier) {
    const { assetMultiplier } = player
    const multiplierDamage =
      (assetMultiplier >= 20 ? 20 : assetMultiplier) * damagePerAowl
    return Math.floor(Math.random() * damageRange) + multiplierDamage
  } else {
    return Math.floor(Math.random() * damageRange)
  }
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
