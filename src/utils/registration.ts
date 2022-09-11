import { determineOwnership } from './algorand'
import { getSettings } from './settings'
import Asset, { KeyedAssets } from '../models/asset'
import User from '../models/user'
import { WithId } from 'mongodb'
import { collections } from '../database/database.service'
import { RegistrationResult } from '../types/user'
import { ButtonInteraction } from 'discord.js'

// Globals
const optInAssetId: number = Number(process.env.OPT_IN_ASSET_ID)
const unitName: string = process.env.UNIT_NAME

/**
 * Takes user info, queries the blockchain and finds owned assets and stores entry in database
 * @param username
 * @param discordId
 * @param address algorand wallet address
 * @param channelId
 * @returns {RegistrationResult}
 */
export const processRegistration = async (
  username: string,
  discordId: string,
  address: string,
  channelId: string
): Promise<RegistrationResult> => {
  try {
    const { maxAssets, holdingsRefreshTime } = await getSettings(channelId)

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

    if (!walletOwned) {
      return {
        status: `Looks like you haven't opted in to to asset ${optInAssetId}. Please opt in on Rand Gallery by using this link: https://www.randgallery.com/algo-collection/?address=${optInAssetId}`,
      }
    }

    if (!nftsOwned?.length) {
      return {
        status: `You have no ${unitName}s in this wallet. Please try again with a different address`,
      }
    }

    const keyedNfts: KeyedAssets = keyNfts(nftsOwned)

    // Generate holdings refresh timestamp by days
    const holdingsRefreshDate = Date.now() + holdingsRefreshTime * 86400000

    // If user doesn't exist, add to db and grab instance
    if (!user) {
      const userEntry = new User(
        username,
        discordId,
        address,
        keyedNfts,
        0,
        holdingsRefreshDate
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
      // Update current user entry with relevent data
      const mergedAssets: KeyedAssets = mergeAssets(user.assets, keyedNfts)
      await collections.users.findOneAndUpdate(
        { _id: user._id },
        {
          $set: {
            assets: mergedAssets,
            address: address,
            holdingsRefreshDate,
            hoot: hootOwned,
          },
        }
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

/**
 * Merge current and updated user assets ensuring we retain data from gameplay
 * @param userAssets current user assets stored in db
 * @param updatedAssets current user assets from blockchain
 * @returns {KeyedAssets}
 */
const mergeAssets = (
  userAssets: KeyedAssets,
  updatedAssets: KeyedAssets
): KeyedAssets => {
  const updatedAssetArr: Asset[] = []
  Object.values(updatedAssets).forEach((asset) => {
    // if user already has asset, use current asset data
    if (userAssets[asset.assetId]) {
      updatedAssetArr.push(userAssets[asset.assetId])
    } else {
      updatedAssetArr.push(asset)
    }
  })
  return keyNfts(updatedAssetArr)
}

/**
 * Take an array of assets and key them into an object
 * @param nftArr array of user assets
 * @returns {KeyedAssets}
 */
const keyNfts = (nftArr: Asset[]): KeyedAssets => {
  const keyedNfts: KeyedAssets = {}
  nftArr.forEach((nft: Asset) => {
    keyedNfts[nft.assetId] = nft
  })
  return keyedNfts
}

/**
 * Finds user and refreshes asset holdings if after refresh date
 * @param discordId
 * @param channelId
 * @returns {User}
 */
export const findOrRefreshUser = async (
  discordId: string,
  channelId: string,
  interaction: ButtonInteraction
): Promise<User | undefined> => {
  let user

  user = (await collections.users.findOne({
    discordId,
  })) as WithId<User>

  if (user.holdingsRefreshDate < Date.now()) {
    interaction.editReply('Updating your nft holdings...')
    const { username, address } = user
    // update user assets and add new holdingsRefreshDate
    const { registeredUser } = await processRegistration(
      username,
      discordId,
      address,
      channelId
    )
    if (registeredUser) {
      user = registeredUser
    }
  }
  return user
}
