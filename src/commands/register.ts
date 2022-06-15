import { RegistrationResult } from '../types/user'
import algosdk from 'algosdk'
import { determineOwnership, findAsset } from '../utils/helpers'
import User from '../models/user'
import { collections } from '../database/database.service'
import { WithId } from 'mongodb'
import Asset from '../models/asset'
import Player from '../models/player'
import { SlashCommandBuilder } from '@discordjs/builders'
import { Interaction } from 'discord.js'
import { game } from '..'
import { addRole } from '../utils/helpers'
import settings from '../settings'

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

module.exports = {
  data: new SlashCommandBuilder()
    .setName('register')
    .setDescription('register for When AOWLS Attack')
    .addStringOption((option) =>
      option
        .setName('address')
        .setDescription('enter the your wallet address')
        .setRequired(true)
    ),
  // .addNumberOption((option) =>
  //   option
  //     .setName('assetid')
  //     .setDescription('enter your AOWLS asset ID')
  //     .setRequired(true)
  // ),
  async execute(interaction: Interaction) {
    if (!interaction.isCommand()) return

    const { user, options } = interaction
    const { hp } = settings

    if (game?.active) {
      return interaction.reply({
        content: 'Please wait until after the game ends to register',
        ephemeral: true,
      })
    }
    // TODO: add ability to register for different games here
    const address = options.getString('address')
    // const assetId = options.getNumber('assetid')

    const { username, id } = user

    if (address) {
      const { status, registeredUser, asset } = await processRegistration(
        username,
        id,
        address,
        // assetId,
        'yao',
        hp
      )
      // add permissions if succesful
      if (registeredUser && asset) {
        addRole(interaction, process.env.REGISTERED_ID, registeredUser)
      }

      await interaction.reply({
        ephemeral: registeredUser ? false : true,
        content: status,
      })
    }
  },
}

export const processRegistration = async (
  username: string,
  discordId: string,
  address: string,
  // assetId: number,
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

    // Check if asset is owned and wallet has opt-in asset
    // Retreive assetIds from specific collections
    const { walletOwned, nftsOwned } = await determineOwnership(
      algodClient,
      algoIndexer,
      address
      // assetId
    )

    // If user doesn't exist, add to db and grab instance
    if (!user) {
      const userEntry = new User(username, discordId, address, nftsOwned)
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
    } else {
      collections.users.findOneAndUpdate(
        { _id: user._id },
        { $set: { assets: [...user.assets, ...nftsOwned], address } }
      )
    }

    // const isOwned = walletOwned && assetOwned

    if (!walletOwned) {
      return {
        status: `Looks like you haven't opted in to to asset ${optInAssetId}. Please opt in on Rand Gallery by using this link: https://www.randgallery.com/algo-collection/?address=${optInAssetId}`,
      }
    }

    // // // // If owned, find full player and asset data
    // const player = (await collections.yaoPlayers.findOne({
    //   discordId,
    // })) as WithId<Player>

    // const asset = await findAsset(assetId, algoIndexer)

    // if there's no asset, return right away
    // if (!asset) {
    //   return {
    //     status:
    //       "Looks like you don't own this NFT, try again with one in your possession.",
    //   }
    // }

    // Destructure asset values and store in db
    // const {
    //   name: assetName,
    //   url: assetUrl,
    //   'unit-name': unitName,
    // } = asset?.params

    // let assetEntry: Asset | undefined
    // let assetStored = false

    // if (user?._id) {
    //   const dbAssetEntry = (await collections.assets.findOne({
    //     assetId,
    //   })) as WithId<Asset>
    //   if (dbAssetEntry) {
    //     assetEntry = dbAssetEntry
    //     assetStored = true
    //   } else {
    //     assetEntry = new Asset(
    //       user?._id,
    //       assetId,
    //       assetName,
    //       assetUrl,
    //       unitName
    //     )
    //     // Add asset
    //     await collections.assets.insertOne(assetEntry)
    //     // Add asset ref to user object
    //     await collections.users.findOneAndUpdate(
    //       { _id: user._id },
    //       { $set: { assets: [...user.assets, assetId] } }
    //     )
    //   }
    //   // add error handling here
    // }

    // Check to make sure NFT is in correct series
    // const incorrectCollection =
    //   unitName.slice(0, unitPrefix.length) !== unitPrefix

    // if (incorrectCollection) {
    //   return {
    //     status: `This asset is not a ${unitPrefix}, please try again`,
    //   }
    // }

    // if (player) {
    // if player exists and asset is stored, return
    // if (assetStored) {
    //   return {
    //     status: "Looks like you've already registered",
    //   }
    // }
    // if player and new asset, update player entry
    //   await collections.yaoPlayers.findOneAndUpdate(
    //     { _id: player._id },
    //     { $set: { asset: assetEntry } }
    //   )
    //   return {
    //     status: `Replaced previous asset with ${assetEntry?.unitName} `,
    //   }
    // }

    // // Player doesn't exist, add to db
    // if (assetEntry) {
    //   const playerEntry = new Player(
    //     username,
    //     discordId,
    //     address,
    //     assetEntry,
    //     user._id,
    //     hp
    //   )
    //   await collections.yaoPlayers.insertOne(playerEntry)
    // }

    return {
      // status: `Added ${unitName} - Prepare to attack!`,
      status: `Thanks for registering!`,
      // asset: assetEntry,
      registeredUser: user,
    }
  } catch (error) {
    console.log('ERROR::', error)
    return {
      status: 'Something went wrong during registration, please try again',
    }
  }
}
