import { findPlayer, addPlayer } from '../database/operations'
import { RegistrationResult } from '../types/user'
import algosdk from 'algosdk'
import { determineOwnership, findAsset } from '../utils/helpers'
import User from '../models/user'
import { collections } from '../database/database.service'
import { WithId } from 'mongodb'
import Asset from '../models/asset'
import Player from '../models/player'

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

const processRegistration = async (
  username: string,
  discordId: string,
  address: string,
  assetId: number,
  gameType: string = 'yao',
  hp: number
): Promise<RegistrationResult> => {
  try {
    const algodClient = new algosdk.Algodv2(token, server, port)
    const algoIndexer = new algosdk.Indexer(token, indexerServer, port)

    // Attempt to find user in db
    let user = (await collections.users?.findOne({
      discordId,
    })) as WithId<User>

    // If user doesn't exist, add to db and grab instance
    if (!user) {
      const userEntry = new User(username, discordId, address, [])
      const { acknowledged, insertedId } = await collections.users?.insertOne(
        userEntry
      )
      if (acknowledged) {
        user = (await collections.users?.findOne({
          _id: insertedId,
        })) as WithId<User>
      } else {
        return {
          status: 'Something went wrong during registration, please try again',
        }
      }
    }

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
      }
    }

    // // // // If owned, find full player and asset data
    const player = await collections.yaoPlayers.findOne({
      discordId,
    })
    console.log('player', player)
    const asset = await findAsset(assetId, algoIndexer)

    // if there's no asset, return right away
    if (!asset) {
      return {
        status:
          "Looks like you don't own this NFT, try again with one in your possession.",
      }
    }

    // Destructure asset values and store in db

    const {
      name: assetName,
      url: assetUrl,
      'unit-name': unitName,
    } = asset?.assets[0].params

    let assetEntry

    if (user?._id) {
      const dbEntry = await collections.assets.findOne({ assetId })
      if (dbEntry) {
        assetEntry = dbEntry
      } else {
        assetEntry = new Asset(
          user?._id,
          assetId,
          assetName,
          assetUrl,
          unitName
        )
        await collections.assets.insertOne(assetEntry)
      }
      // add error handling here
    }

    // Check to make sure NFT is in correct series
    const incorrectCollection =
      unitName.slice(0, unitPrefix.length) !== unitPrefix

    if (incorrectCollection) {
      return {
        status: `This asset is not a ${unitPrefix}, please try again`,
      }
    }

    if (player) {
      // if there is already a player, only add asset
      return {
        status: "Looks like you've already registered",
      }
    }

    // Player doesn't exist, add to db
    if (assetEntry) {
      const playerEntry = new Player(
        username,
        discordId,
        address,
        assetEntry,
        hp
      )
      const result = await collections.yaoPlayers.insertOne(playerEntry)
      console.log('result', result)
    }

    return {
      status: `Added ${unitName} - Prepare to attack!`,
      asset: assetEntry,
      registeredUser: user,
    }
  } catch (error) {
    console.log('ERROR::', error)
    return {
      status: 'Something went wrong during registration, please try again',
    }
  }
}

export { processRegistration }
