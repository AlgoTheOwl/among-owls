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

module.exports = {
  data: new SlashCommandBuilder()
    .setName('select-attacker')
    .setDescription(`Pick which AOWL you'd like to compete`),
  async execute(interaction: ButtonInteraction) {
    const {
      user: { id },
    } = interaction
    const { assets } = (await collections.users.findOne({
      discordId: id,
    })) as WithId<User>

    if (!game.waitingRoom) {
      return interaction.reply({
        content: 'Game is not currently active',
        ephemeral: true,
      })
    }

    if (assets?.length) {
      const options = assets.map((asset: Asset) => {
        return {
          label: asset.assetName,
          description: 'Select to play',
          value: asset.assetId.toString(),
        }
      })

      const row = new MessageActionRow().addComponents(
        new MessageSelectMenu()
          .setCustomId('register-player')
          .setPlaceholder('Select an AOWL to attack')
          .addOptions(options)
      )

      await interaction.reply({
        content: 'Choose your AOWL',
        components: [row],
        ephemeral: true,
      })
    }
  },
}
