import { SlashCommandBuilder } from '@discordjs/builders'
import { MessageEmbed, MessagePayload, SelectMenuInteraction } from 'discord.js'
import { WithId } from 'mongodb'
import embeds from '../constants/embeds'
import { collections } from '../database/database.service'
import doEmbed from '../embeds'
import User from '../models/user'

module.exports = {
  data: new SlashCommandBuilder()
    .setName('asset-profile')
    .setDescription('view an asset profile'),
  async execute(interaction: SelectMenuInteraction) {
    if (!interaction.isSelectMenu()) return

    await interaction.deferReply({ ephemeral: true })
    console.log('getting asset profile')
    const { values, user } = interaction
    const assetId = Number(values[0])
    const discordId = user.id

    const { assets } = (await collections.users.findOne({
      discordId,
    })) as WithId<User>

    const asset = assets.find((asset) => asset.assetId === assetId)
    if (asset) {
      const { assetUrl, assetName, unitName, assetId } = asset

      const fields = [
        { name: 'Unit name', value: unitName },
        { name: 'Asset ID', value: assetId.toString() },
      ]
      interaction.editReply(
        doEmbed(embeds.assetProfile, {
          assetUrl,
          fields,
          assetName,
        }) as MessagePayload
      )
    }
  },
}
