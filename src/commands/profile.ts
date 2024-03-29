// Discord
import { SlashCommandBuilder } from '@discordjs/builders'
import {
  SelectMenuBuilder,
  Interaction,
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
import { getSettings } from '../utils/settings'
// Globals

module.exports = {
  data: new SlashCommandBuilder()
    .setName('profile')
    .setDescription('view your profile'),
  enabled: true,
  /**
   * Sends users profile to client
   * Includes dropdown menu that allows user to trigger asset-profile command
   * @param interaction {Interactioon}
   * @returns {void}
   */
  async execute(interaction: Interaction) {
    try {
      if (interaction.type !== InteractionType.ApplicationCommand) return

      const { user, channelId } = interaction
      const { maxAssets } = await getSettings(channelId)

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

      const wins = assetArray.reduce(
        (accumulator: number, currentValue: Asset) => {
          return accumulator + currentValue.wins
        },
        0
      )

      const losses = assetArray.reduce(
        (accumulator: number, currentValue: Asset) => {
          return accumulator + currentValue.losses
        },
        0
      )

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

      const hoot = userData.hoot ? userData.hoot : 0
      const yaoWins = userData.yaoWins ? userData.yaoWins : 0
      const yaoLosses = userData.yaoLosses ? userData.yaoLosses : 0
      const yaoKos = userData.yaoKos ? userData.yaoKos : 0
      // discord username
      fields.push(
        { name: 'Username', value: user.username },
        { name: 'Hoot owned', value: hoot.toString() },
        { name: 'Games won', value: yaoWins.toString() },
        { name: 'Games lost', value: yaoLosses.toString() },
        { name: 'Total KOs', value: yaoKos.toString() }
      )

      const row = new ActionRowBuilder().addComponents(selectMenu)
      const embed = doEmbed(embeds.profile, channelId, {
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
      console.log('****** PROFLE ERROR ******', error)
    }
  },
}

const getAssetRounds = (asset: Asset) => asset.wins + asset.losses
