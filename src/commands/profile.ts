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

    const { assets, ...userData } = (await collections.users.findOne({
      discordId: user.id,
    })) as WithId<User>

    const selectMenu = new MessageSelectMenu()
      .setCustomId('register-player')
      .setPlaceholder('See your AOWL stats')

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

    const fields = []
    let thumbNail
    // picture of first asset
    const firstAsset = assets[0]?.assetUrl
    if (firstAsset) {
      thumbNail = firstAsset
    }

    const hoot = userData.hoot ? userData.hoot.toString() : '0'
    const yaoWins = userData.yaoWins ? userData.yaoWins.toString() : '0'
    // discord username
    fields.push(
      { name: 'Username', value: user.username },
      { name: 'Hoot owned', value: hoot },
      { name: 'Games won', value: yaoWins }
    )

    console.log('fields', fields)
    const row = new MessageActionRow().addComponents(selectMenu)
    const embed = doEmbed(embeds.profile, { thumbNail, fields }) as MessageEmbed

    await interaction.editReply({
      content: 'Choose your AOWL',
      components: [row],
      embeds: [embed],
    })
  },
}
