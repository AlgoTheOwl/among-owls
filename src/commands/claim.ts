import { SlashCommandBuilder } from '@discordjs/builders'
import { Interaction } from 'discord.js'
import { WithId } from 'mongodb'
import { collections } from '../database/database.service'
import User from '../models/user'

module.exports = {
  data: new SlashCommandBuilder()
    .setName('claim')
    .setDescription('claim your hoot!'),
  async execute(interaction: Interaction) {
    if (!interaction.isCommand()) return

    const { user } = interaction

    await interaction.deferReply({ ephemeral: true })

    const userData = (await collections.users.findOne({
      discordId: user.id,
    })) as WithId<User>

    if (!userData) {
      return interaction.reply({
        content: 'You are not in the database',
        ephemeral: true,
      })
    }

    const { hoot } = userData
  },
}
