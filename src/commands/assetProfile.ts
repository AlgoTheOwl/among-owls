// Discord
import { SlashCommandBuilder } from '@discordjs/builders'
import { MessagePayload, SelectMenuInteraction } from 'discord.js'
//Data
import { collections } from '../database/database.service'
// Schemas
import { WithId } from 'mongodb'
import embeds from '../constants/embeds'
import User from '../models/user'
// Embeds
import doEmbed from '../embeds'

module.exports = {
  data: new SlashCommandBuilder()
    .setName('asset-profile')
    .setDescription('view an asset profile'),
  enabled: true,
  async execute(interaction: SelectMenuInteraction) {
    if (!interaction.isSelectMenu()) return

    await interaction.deferReply()
    const { values, user } = interaction
    const assetId = Number(values[0])
    const discordId = user.id

    const { assets } = (await collections.users.findOne({
      discordId,
    })) as WithId<User>

    const asset = assets[assetId]
    if (asset) {
      const { assetUrl, assetName, unitName, assetId, wins } = asset

      const winNumber = wins ? wins : 0

      const fields = [
        { name: 'Unit name', value: unitName },
        { name: 'Asset ID', value: assetId.toString() },
        { name: 'Wins', value: winNumber.toString() },
      ]
      await interaction.editReply(
        doEmbed(embeds.assetProfile, {
          assetUrl,
          fields,
          assetName,
        }) as MessagePayload
      )
    }
  },
}
