import AlgodClient from 'algosdk/dist/types/src/client/v2/algod/algod'
import fs from 'fs'
import path from 'path'
import axios from 'axios'
import { Indexer } from 'algosdk'
import { Asset } from '../types/user'
import User from '../models/user'
import { Interaction } from 'discord.js'
import Player from '../models/player'
import { game } from '..'
import { collections } from '../database/database.service'
import { WithId } from 'mongodb'
import { EmbedData } from '../types/game'
import doEmbed from '../embeds'

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

export const handleRolledRecently = async (
  player: Player,
  coolDownInterval: number
) => {
  player.coolDownTimeLeft = coolDownInterval
  while (player.coolDownTimeLeft > 0) {
    await wait(1000)
    player.coolDownTimeLeft -= 1000
  }
  // turn rolled recently to true
  player.rolledRecently = true
  // set Timeout and remove after 20 seconds
  setTimeout(() => {
    player.rolledRecently = false
  }, 20000)
}

export const mapPlayersForEmbed = (playerArr: Player[]) =>
  playerArr.map((player) => ({
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
    console.log(error)
    throw new Error('Error deleting contents of image directory')
  }
}

export const addRole = async (
  interaction: Interaction,
  roleName: string,
  user: User
) => {
  try {
    const role = interaction.guild?.roles.cache.find(
      (role) => role.name === roleName
    )
    const member = interaction.guild?.members.cache.find(
      (member) => member.id === user.discordId
    )
    role && (await member?.roles.add(role.id))
  } catch (error) {
    throw new Error('Error adding role')
  }
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
  playerArr: Player[],
  interaction: Interaction
) => {
  if (!interaction.isCommand()) return
  const winner = playerArr[0]
  // handle win
  game.active = false

  // Increment score of winning player
  const winningUser = (await collections.users.findOne({
    _id: winner.userId,
  })) as WithId<User>

  const updatedScore = winningUser.yaoWins ? winningUser.yaoWins + 1 : 1

  await collections.users.findOneAndUpdate(
    { _id: winner.userId },
    { $set: { yaoWins: updatedScore } }
  )

  const embedData: EmbedData = {
    title: 'WINNER!!!',
    description: `${winner.username}'s ${winner.asset.unitName} destroyed the competition`,
    color: 'DARK_AQUA',
    image: winner.asset.assetUrl,
  }

  // collections.players.deleteMany({})

  interaction.followUp({ ephemeral: true, content: 'You WON!!!' })

  return game.embed.edit(doEmbed(embedData))
}
