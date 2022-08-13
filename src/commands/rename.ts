// Discord
import { SlashCommandBuilder } from '@discordjs/builders'
import { Interaction } from 'discord.js'
// Globals
import { game } from '..'
import { collections } from '../database/database.service'
import User from '../models/user'
import { WithId } from 'mongodb'
import { updateGame } from '../utils/helpers'
import Asset from '../models/asset'

module.exports = {
  data: new SlashCommandBuilder()
    .setName('rename')
    .setDescription('Rename your AOWL')
    .addStringOption((option) =>
      option
        .setName('name')
        .setDescription('enter a new name for your AOWL')
        .setRequired(true)
    ),
  enabled: true,
  async execute(interaction: Interaction) {
    if (!interaction.isChatInputCommand()) return
    const { user } = interaction
    const name = interaction.options.getString('name') as string

    const player = game?.players[user.id] || null
    let assetId: number | undefined

    const userData = (await collections.users.findOne({
      discordId: user.id,
    })) as WithId<User>

    // Grab assetId
    if (player) {
      // update local state
      player.asset.alias = name
      // grab assetId from registered player
      assetId = player.asset.assetId
    } else {
      // grab assetID from db
      assetId = userData?.selectedAssetId
    }

    // Player has no assetId
    if (!assetId) {
      interaction.reply({
        content: `Please select an asset in your user profile (/profile) or enter the waiting room to register`,
        ephemeral: true,
      })
    } else {
      // Update assets in db
      const { assets } = userData

      const updatedAsset: Asset = {
        ...userData.assets[assetId],
        alias: name,
      }

      const updatedAssets = { ...assets, [assetId]: updatedAsset }

      await collections.users.findOneAndUpdate(
        { _id: userData._id },
        {
          $set: {
            assets: updatedAssets,
            selectedAssetId: undefined,
          },
        }
      )

      interaction.reply({
        content: `Your AOWL is now named ${name}`,
        ephemeral: true,
      })
      updateGame()
    }
  },
}
