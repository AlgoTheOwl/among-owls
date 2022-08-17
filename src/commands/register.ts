// Discord
import { SlashCommandBuilder } from '@discordjs/builders'
// Data
import { collections } from '../database/database.service'
// Helpers
import { determineOwnership } from '../utils/algorand'
import { addRole } from '../utils/helpers'
// Schemas
import { RegistrationResult } from '../types/user'
import User from '../models/user'
import { WithId } from 'mongodb'
import { Interaction } from 'discord.js'
import Asset from '../models/asset'
import settings from '../settings'
// Globals
const optInAssetId: number = Number(process.env.OPT_IN_ASSET_ID)
const unitName: string = process.env.UNIT_NAME

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
  enabled: true,
  async execute(interaction: Interaction) {
    if (!interaction.isChatInputCommand()) return

    const { user, options, channelId } = interaction
    const { maxAssets } = settings[channelId]

    // TODO: add ability to register for different games here
    const address = options.getString('address')

    if (address && !/^[a-zA-Z0-9]{58}$/.test(address)) {
      return interaction.reply({
        content: 'Please enter a valid Algorand wallet address',
        ephemeral: true,
      })
    }

    const { username, id } = user

    await interaction.deferReply({ ephemeral: true })

    await interaction.followUp({
      content:
        'Thanks for registering! This might take a while! Please check back in a few minutes',
      ephemeral: true,
    })
    if (address) {
      const { status, registeredUser, asset } = await processRegistration(
        username,
        id,
        address,
        maxAssets
      )
      // add permissions if succesful
      if (registeredUser && asset) {
        addRole(interaction, process.env.REGISTERED_ID, registeredUser)
      }

      await interaction.followUp({
        ephemeral: true,
        content: status,
      })
    }
  },
}

export const processRegistration = async (
  username: string,
  discordId: string,
  address: string,
  maxAssets: number
): Promise<RegistrationResult> => {
  try {
    // Attempt to find user in db
    let user = (await collections.users?.findOne({
      discordId,
    })) as WithId<User>

    // Check to see if wallet has opt-in asset
    // Retreive assetIds from specific collections
    const { walletOwned, nftsOwned, hootOwned } = await determineOwnership(
      address,
      maxAssets
    )

    const keyedNfts: { [key: string]: Asset } = {}
    nftsOwned.forEach((nft) => {
      keyedNfts[nft.assetId] = nft
    })

    if (!nftsOwned?.length) {
      return {
        status: `You have no ${unitName}s in this wallet. Please try again with a different address`,
      }
    }

    if (!walletOwned) {
      return {
        status: `Looks like you haven't opted in to to asset ${optInAssetId}. Please opt in on Rand Gallery by using this link: https://www.randgallery.com/algo-collection/?address=${optInAssetId}`,
      }
    }

    // If user doesn't exist, add to db and grab instance
    if (!user) {
      const userEntry = new User(
        username,
        discordId,
        address,
        keyedNfts,
        hootOwned
      )
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
      await collections.users.findOneAndUpdate(
        { _id: user._id },
        { $set: { assets: keyedNfts, address: address } }
      )
    }

    return {
      status: `Registration complete! Enjoy the game.`,
      registeredUser: user,
    }
  } catch (error) {
    console.log('ERROR::', error)
    return {
      status: 'Something went wrong during registration, please try again',
    }
  }
}
