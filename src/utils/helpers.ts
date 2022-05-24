import AlgodClient from 'algosdk/dist/types/src/client/v2/algod/algod'
import fs from 'fs'
import axios from 'axios'
import { Indexer } from 'algosdk'
import { Asset } from '../types/user'
import User from '../models/user'
import Game from '../models/game'
import AccountInformation from 'algosdk/dist/types/src/client/v2/algod/accountInformation'

export const wait = async (duration: number) => {
  await new Promise((res) => {
    setTimeout(res, duration)
  })
}

export const asyncForEach = async (array: Array<any>, callback: any) => {
  for (let index = 0; index < array.length; index++) {
    try {
      await callback(array[index], index, array)
    } catch (error) {
      console.log('ERROR', error)
    }
  }
}

export const determineOwnership = async function (
  algodclient: AlgodClient,
  address: string,
  assetId: number,
  test: boolean
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
        asset['asset-id'] === assetId && test
          ? asset.amount >= 0
          : asset.amount > 0
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
        writer.on('error', reject)
      })
    }
  } catch (error) {
    console.log(error)
  }
}

export const normalizeLink = (imageUrl: string) => {
  if (imageUrl?.slice(0, 4) === 'ipfs') {
    const ifpsHash = imageUrl.slice(7)
    imageUrl = `${ipfsGateway}${ifpsHash}`
  }
  return imageUrl
}

export const handleRolledRecently = (
  user: User,
  game: Game,
  coolDownInterval: number
) => {
  game?.rolledRecently.add(user.discordId)

  setTimeout(() => {
    game?.rolledRecently.delete(user.discordId)
  }, coolDownInterval + 1500)
}

export const mapPlayersForEmbed = (playerArr: User[]) =>
  playerArr.map((player) => ({
    name: player.username,
    value: `HP: ${player.hp}`,
  }))
