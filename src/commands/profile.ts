// Discord
import { SlashCommandBuilder } from '@discordjs/builders'
import {
  SelectMenuBuilder,
  Interaction,
  MessageActionRowComponent,
  EmbedBuilder,
  InteractionType,
  ActionRowBuilder,
} from 'discord.js'
// Data
import { collections } from '../database/database.service'
import Asset from '../models/asset'
// Shcemas
import { WithId } from 'mongodb'
import User from '../models/user'
import embeds from '../constants/embeds'
// Helpers
import doEmbed from '../embeds'
// Globals
import settings from '../settings'

module.exports = {
  data: new SlashCommandBuilder()
    .setName('profile')
    .setDescription('view your profile'),
  enabled: true,
  async execute(interaction: Interaction) {
    try {
      if (interaction.type !== InteractionType.ApplicationCommand) return

      const { maxAssets } = settings

      const { user } = interaction

      await interaction.deferReply()

      const userData =
        ((await collections.users.findOne({
          discordId: user.id,
        })) as WithId<User>) || null

      if (!userData) {
        return interaction.editReply({
          content: 'You need to register to use this command',
        })
      }

      const selectMenu = new SelectMenuBuilder()
        .setCustomId('asset-profile')
        .setPlaceholder('See your AOWL stats')

      const assetArray = Object.values(userData.assets)

      if (!assetArray.length) {
        return interaction.editReply({
          content: 'You have no AOWLS to profile.',
        })
      }

      const options = assetArray
        .map((asset: Asset, i: number) => {
          if (i < maxAssets) {
            return {
              label: asset.alias || asset.assetName,
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
      const firstAsset = userData.assets[0]?.assetUrl
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

      const row = new ActionRowBuilder().addComponents(selectMenu)
      const embed = doEmbed(embeds.profile, {
        thumbNail,
        fields,
      }) as EmbedBuilder

      await interaction.editReply({
        content: 'Choose your AOWL',
        //@ts-ignore
        components: [row],
        embeds: [embed],
      })
    } catch (error) {
      console.log('Error getting profile')
      console.log(error)
    }
  },
}
