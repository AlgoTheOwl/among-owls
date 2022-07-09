import { SlashCommandBuilder } from '@discordjs/builders'
import {
  MessageSelectMenu,
  Interaction,
  MessageActionRow,
  MessageEmbed,
} from 'discord.js'
import { WithId } from 'mongodb'
import { collections } from '../database/database.service'
import Asset from '../models/asset'
import settings from '../settings'
import User from '../models/user'
import embeds from '../constants/embeds'
import doEmbed from '../embeds'

module.exports = {
  data: new SlashCommandBuilder()
    .setName('profile')
    .setDescription('view your profile'),
  async execute(interaction: Interaction) {
    if (!interaction.isCommand()) return

    const { maxAssets } = settings

    const { user } = interaction

    await interaction.deferReply()

    const { assets } = (await collections.users.findOne({
      discordId: user.id,
    })) as WithId<User>

    const selectMenu = new MessageSelectMenu()
      .setCustomId('register-player')
      .setPlaceholder('Select an AOWL to attack')

    const options = assets
      .map((asset: Asset, i: number) => {
        if (i < maxAssets) {
          return {
            label: asset.assetName,
            description: 'Select and AOWL to view',
            value: asset?.assetId?.toString(),
          }
        }
      })
      .filter(Boolean) as {
      label: string
      description: string
      value: string
    }[]

    if (options.length) {
      selectMenu.addOptions(options)
    }

    // const fields =

    // picture of first asset
    // discord username
    // field for hoot owned
    // field for games won
    // time sent
    // possible collage of all nfts owned

    const row = new MessageActionRow().addComponents(selectMenu)
    const embed = doEmbed(embeds.profile, {}) as MessageEmbed

    await interaction.editReply({
      content: 'Choose your AOWL',
      components: [row],
      embeds: [embed],
    })
  },
}
