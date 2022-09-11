// Discord
import {
  ActionRowBuilder,
  ButtonInteraction,
  SelectMenuBuilder,
} from 'discord.js'
import { SlashCommandBuilder } from '@discordjs/builders'
// Data
// Schemas
import Asset from '../models/asset'
// Helpers
import { findOrRefreshUser } from '../utils/registration'
// Globals
import { games } from '..'
import { getSettings } from '../utils/settings'

module.exports = {
  data: new SlashCommandBuilder()
    .setName('select-attacker')
    .setDescription(`Pick which AOWL you'd like to compete`),
  /**
   * Sends a select menu to user to select an AOWL for registratiion
   * @param interaction {Interaction}
   * @returns {void}
   */
  async execute(interaction: ButtonInteraction) {
    try {
      const {
        user: { id },
        channelId,
      } = interaction

      const game = games[channelId]

      const { maxAssets } = await getSettings(channelId)

      if (!game.waitingRoom) {
        return interaction.reply({
          content:
            'Game is not currently active. Use the /start command to start the game',
          ephemeral: true,
        })
      }

      await interaction.deferReply({ ephemeral: true })

      const user = await findOrRefreshUser(id, channelId, interaction)

      if (!user) {
        return interaction.editReply({
          content: 'You are not registered. Use the /register command',
        })
      }

      const assetData = user?.assets ? Object.values(user.assets) : []

      if (!assetData.length) {
        return interaction.editReply({
          content: 'You have no AOWLs to select!',
        })
      }

      const options = Object.values(user.assets)
        .map((asset: Asset, i: number) => {
          if (i < maxAssets) {
            const label = asset.alias || asset.assetName
            const normalizedLabel = label.slice(0, 20)
            return {
              label: normalizedLabel,
              description: 'Select to play',
              value: asset?.assetId?.toString(),
            }
          }
        })
        .filter(Boolean) as {
        label: string
        description: string
        value: string
      }[]

      const selectMenu = new SelectMenuBuilder()
        .setCustomId('register-player')
        .setPlaceholder('Select an AOWL to attack')

      if (options.length) {
        selectMenu.addOptions(options)
      }

      const row = new ActionRowBuilder().addComponents(selectMenu)

      await interaction.editReply({
        content: 'Choose your AOWL',
        //@ts-ignore
        components: [row],
      })
    } catch (error) {
      console.log('****** PLAYER SELECTION ERROR ******', error)
    }
  },
}
