// Discord
import { SlashCommandBuilder } from '@discordjs/builders'
import { MessagePayload, SelectMenuInteraction } from 'discord.js'
// Data
import { collections } from '../database/database.service'
// Schemas
import embeds from '../constants/embeds'
import User from '../models/user'
// Embeds
import doEmbed from '../embeds'
// MongoDb
import { WithId } from 'mongodb'

module.exports = {
  data: new SlashCommandBuilder()
    .setName('asset-profile')
    .setDescription('view an asset profile'),
  async execute(interaction: SelectMenuInteraction) {
    if (!interaction.isSelectMenu()) return

    await interaction.deferReply()
    const { values, user, channelId } = interaction
    const assetId = Number(values[0])
    const discordId = user.id

    const initialUserData = (await collections.users.findOne({
      discordId,
    })) as WithId<User>

    if (!initialUserData.assets[assetId]) {
      return interaction.editReply({
        content: `You can't see another users asset profile`,
      })
    }

    const { value: userData } = (await collections.users.findOneAndUpdate(
      {
        discordId,
      },
      {
        $set: { selectedAssetId: assetId },
      },
      { returnDocument: 'after' }
      // Why won't it let me user the User model?
    )) as any | User

    if (!userData) {
      return interaction.editReply({
        content: 'Please register before trying to view assets',
      })
    }

    const asset = userData.assets[assetId]
    if (asset) {
      const { assetUrl, assetName, unitName, assetId, wins, alias } = asset

      const winNumber = wins ? wins : 0

      const fields = [
        { name: 'Unit name', value: unitName },
        { name: 'Asset name', value: assetName.slice(0, 100) },
        { name: 'Asset ID', value: assetId.toString() },
        { name: 'Wins', value: winNumber.toString() },
      ]

      if (alias) {
        fields.splice(1, 0, { name: 'Custom name', value: alias.slice(0, 100) })
      }

      await interaction.editReply(
        doEmbed(embeds.assetProfile, channelId, {
          assetUrl,
          fields,
          assetName,
        }) as MessagePayload
      )
    }
  },
}
