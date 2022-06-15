import {
  ButtonInteraction,
  MessageActionRow,
  MessageSelectMenu,
} from 'discord.js'
import { SlashCommandBuilder } from '@discordjs/builders'

module.exports = {
  data: new SlashCommandBuilder()
    .setName('select-attacker')
    .setDescription(`Pick which AOWL you'd like to compete`),
  async execute(interaction: ButtonInteraction) {
    // This step gets all of your NFTs from your user object
    // It should also download asset from the blockchain

    const row = new MessageActionRow().addComponents(
      new MessageSelectMenu()
        .setCustomId('create-player')
        .setPlaceholder('Select an AOWL to attack')
        .addOptions([
          {
            label: 'Select me',
            description: 'This is a description',
            value: 'first_option',
          },
          {
            label: 'You can select me too',
            description: 'This is also a description',
            value: 'second_option',
          },
        ])
    )

    await interaction.reply({
      content: 'Choose your AOWL',
      components: [row],
      ephemeral: true,
    })
  },
}
