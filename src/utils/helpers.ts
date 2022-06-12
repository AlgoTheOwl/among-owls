import AlgodClient from 'algosdk/dist/types/src/client/v2/algod/algod'
import fs from 'fs'
import path from 'path'
import axios from 'axios'
import { Indexer } from 'algosdk'
import { Asset } from '../types/user'
import User from '../models/user'
import { Interaction } from 'discord.js'
import Player from '../models/player'
import { collections } from '../database/database.service'
import { WithId } from 'mongodb'
import { EmbedData, Field } from '../types/game'
import doEmbed from '../embeds'
import { intervals } from '..'
import Game from '../models/game'

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

export const determineOwnership = async function (
  algodclient: AlgodClient,
  address: string,
  assetId: number
): Promise<any> {
  try {
    let accountInfo = await algodclient.accountInformation(address).do()

    let assetOwned = false
    let walletOwned = false
    accountInfo.assets.forEach((asset: any) => {
      // Check for opt-in asset
      if (asset[`asset-id`] === Number(process.env.OPT_IN_ASSET_ID)) {
        walletOwned = true
      }
      // Check for entered asset
      if (
        // test case option
        asset['asset-id'] === assetId &&
        asset.amount > 0
      ) {
        assetOwned = true
      }
    })
    return {
      assetOwned,
      walletOwned,
    }
  } catch (error) {
    console.log(error)
    throw new Error('error determening ownership')
  }
}

export const findAsset = async (assetId: number, indexer: Indexer) => {
  try {
    return await indexer.searchForAssets().index(assetId).do()
  } catch (error) {
    throw new Error('Error finding asset')
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
      const url = normalizeLink(assetUrl)
      const path = `${directory}/${username}.jpg`
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

export const normalizeLink = (imageUrl: string) => {
  if (imageUrl?.slice(0, 4) === 'ipfs') {
    const ifpsHash = imageUrl.slice(7)
    imageUrl = `${ipfsGateway}${ifpsHash}`
  }
  return imageUrl
}

export const mapPlayersForEmbed = (
  playerArr: Player[]
): { name: string; value: string }[] =>
  playerArr
    .filter((player) => !player.timedOut && !player.dead)
    .map((player) => ({
      name: player.username,
      value: `HP: ${player.hp}`,
    }))

export const emptyDir = (dirPath: string) => {
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
    // throw new Error('Error deleting contents of image directory')
  }
}

export const addRole = async (
  interaction: Interaction,
  roleId: string,
  user: User
) => {
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
    // throw new Error('Error adding role')
  }
}

export const removeRole = async (
  interaction: Interaction,
  roleId: string,
  discordId: string
) => {
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
) => {
  // const role = interaction.guild?.roles.cache.find((role) => role.id === roleId)
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

export const handleWin = async (
  player: Player,
  winByTimeout: boolean,
  game: Game
) => {
  // handle win
  game.active = false
  intervals.timeoutInterval && clearInterval(intervals.timeoutInterval)

  // Increment score of winning player
  const winningUser = (await collections.users.findOne({
    _id: player.userId,
  })) as WithId<User>

  const updatedScore = winningUser.yaoWins ? winningUser.yaoWins + 1 : 1

  await collections.users.findOneAndUpdate(
    { _id: player.userId },
    { $set: { yaoWins: updatedScore } }
  )

  const embedData: EmbedData = {
    title: 'WINNER!!!',
    description: `${player.username}'s ${player.asset.unitName} ${
      winByTimeout
        ? 'won by default - all other players timed out!'
        : `destroyed the competition`
    }`,
    color: 'DARK_AQUA',
    image: player.asset.assetUrl,
  }

  // if (game.active && player.discordId === winningUser.discordId) {
  //   interaction.followUp({ content: 'Woo-Hoot! You won!', ephemeral: true })
  // }

  // collections.yaoPlayers.deleteMany({})

  // asyncForEach(playerArr, (player: Player) => {
  //   removeRole(interaction, process.env.REGISTERED_ID, player.discordId)
  // })

  return game.embed.edit(doEmbed(embedData))
}

export const randomNumber = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min) + min)

export const getWinningPlayer = (
  playerArr: Player[]
): { winningPlayer: Player | undefined; winByTimeout: boolean } => {
  const activePlayers = playerArr.filter(
    (player) => !player.timedOut && !player.dead
  )

  let winByTimeout = false

  // const timedOutPlayers = playerArr.filter((player) => player.timedOut)

  // if (timedOutPlayers.length === playerArr.length - activePlayers.length) {
  //   winByTimeout = true
  // }

  return activePlayers.length === 1
    ? { winningPlayer: activePlayers[0], winByTimeout }
    : { winningPlayer: undefined, winByTimeout: false }
}
