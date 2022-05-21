import { findPlayer, addPlayer } from '../database/operations'
import { Asset, RegistrationResult } from '../types/user'
import algosdk from 'algosdk'
import { determineOwnership, findAsset } from './helpers'
import User from '../models/user'

const algoNode: string = process.env.ALGO_NODE
const pureStakeApi: string = process.env.PURESTAKE_API
const algoIndexerNode: string = process.env.ALGO_INDEXER_NODE
const optInAssetId: number = Number(process.env.OPT_IN_ASSET_ID)
const unitPrefix: string = process.env.UNIT_NAME

const token = {
  'X-API-Key': pureStakeApi,
}
const server: string = algoNode
const indexerServer: string = algoIndexerNode
const port = ''

const processRegistration = async (user: User): Promise<RegistrationResult> => {
  try {
    const algodClient = new algosdk.Algodv2(token, server, port)
    const algoIndexer = new algosdk.Indexer(token, indexerServer, port)
    const {
      discordId,
      username,
      hp,
      address,
      asset: { assetId },
    } = user

    // Check if asset is owned and wallet has opt-in asset
    const { walletOwned, assetOwned } = await determineOwnership(
      algodClient,
      address,
      assetId
    )

    const isOwned = walletOwned && assetOwned

    if (!isOwned) {
      const status = walletOwned
        ? `Looks like the wallet address entered doesn't hold this asset, please try again!`
        : `Looks like you haven't opted in to to asset ${optInAssetId}. Please opt in on Rand Gallery by using this link: https://www.randgallery.com/algo-collection/?address=${optInAssetId}`
      return {
        status,
        registeredUser: user,
      }
    }

    // If owned, find full player and asset data
    const player = await findPlayer(discordId)
    const asset = await findAsset(assetId, algoIndexer)

    const {
      name: assetName,
      url: assetUrl,
      'unit-name': unitName,
    } = asset?.assets[0].params

    const incorrectCollection =
      unitName.slice(0, unitPrefix.length) !== unitPrefix

    if (!asset) {
      return {
        status:
          "Looks like you don't own this NFT, try again with one in your possession.",
        registeredUser: user,
      }
    }

    if (player) {
      return {
        status: "Looks like you've already registered",
        registeredUser: user,
      }
    }

    // Check to make sure NFT is in correct series
    if (incorrectCollection) {
      return {
        status: 'This asset is not a AOWL, please try again',
        registeredUser: user,
      }
    }

    const assetEntry: Asset = {
      assetUrl,
      assetName,
      assetId: assetId,
      unitName,
    }

    // Player doesn't exist, add to db
    await addPlayer({
      discordId,
      username,
      address: address,
      asset: assetEntry,
      hp,
    })

    return {
      status: `Added ${unitName} - Prepare to attack!`,
      asset: assetEntry,
      registeredUser: user,
    }
  } catch (error) {
    console.log('ERROR::', error)
    return {
      status: 'Something went wrong during registration, please try again',
      registeredUser: user,
    }
  }
}

export { processRegistration }
