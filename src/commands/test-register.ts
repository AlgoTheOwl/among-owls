import { SlashCommandBuilder } from '@discordjs/builders'
import { Interaction } from 'discord.js'
import { confirmRole, asyncForEach } from '../utils/helpers'
import { processRegistration } from './register'
import mockUsers from '../mocks/users'
import settings from '../settings'

const roleId: string = process.env.ADMIN_ID

module.exports = {
  data: new SlashCommandBuilder()
    .setName('test-register')
    .setDescription('register multiple mock users'),
  async execute(interaction: Interaction) {
    if (!interaction.isCommand()) return

    const { user } = interaction
    const { hp } = settings

    const hasRole = await confirmRole(roleId, interaction, user.id)

    if (!hasRole) {
      return await interaction.reply({
        content: 'Only administrators can use this command',
        ephemeral: true,
      })
    }

    await asyncForEach(mockUsers, async (player: any, i: number) => {
      const { username, discordId, address, assetId } = player
      await processRegistration(
        username,
        discordId,
        address,
        assetId,
        'yao',
        hp
      )
    })

    await interaction.reply({
      content: 'all test users added',
      ephemeral: true,
    })
  },
}
