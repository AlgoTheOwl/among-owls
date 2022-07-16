import {
  ButtonInteraction,
  MessageActionRow,
  MessageSelectMenu,
} from 'discord.js'
import { SlashCommandBuilder } from '@discordjs/builders'
import { collections } from '../database/database.service'
import User from '../models/user'
import { WithId } from 'mongodb'
import Asset from '../models/asset'
import { game } from '..'
import settings from '../settings'

module.exports = {
  data: new SlashCommandBuilder()
    .setName('select-attacker')
    .setDescription(`Pick which AOWL you'd like to compete`),
  async execute(interaction: ButtonInteraction) {
    try {
      const {
        user: { id },
      } = interaction

      const { maxAssets } = settings

      if (!game.waitingRoom) {
        return interaction.reply({
          content:
            'Game is not currently active. Use the /start command to start the game',
          ephemeral: true,
        })
      }

      await interaction.deferReply({ ephemeral: true })

      const data = (await collections.users.findOne({
        discordId: id,
      })) as WithId<User>

      if (data === null) {
        return interaction.editReply({
          content: 'You are not registered. Use the /register command',
        })
      }

      const assetData = data?.assets ? Object.values(data.assets) : []

      if (!assetData.length) {
        return interaction.editReply({
          content: 'You have no AOWLs to select!',
        })
      }

      const options = Object.values(data.assets)
        .map((asset: Asset, i: number) => {
          if (i < maxAssets) {
            const label =
              asset.assetName.length > 100
                ? asset.assetName.slice(0, 100)
                : asset.assetName
            return {
              label,
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

      const selectMenu = new MessageSelectMenu()
        .setCustomId('register-player')
        .setPlaceholder('Select an AOWL to attack')

      if (options.length) {
        selectMenu.addOptions(options)
      }

      const row = new MessageActionRow().addComponents(selectMenu)

      await interaction.editReply({
        content: 'Choose your AOWL',
        components: [row],
      })
    } catch (error) {
      console.log('ERROR SELECTING')
      console.log(error)
      //@ts-ignore
      console.log(error?.requestData?.json?.components)
    }
  },
}
