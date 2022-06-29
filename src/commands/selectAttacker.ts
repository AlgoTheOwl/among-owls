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
    try {
      const {
        user: { id },
      } = interaction

      if (!game.waitingRoom) {
        return interaction.editReply({
          content: 'Game is not currently active',
        })
      }

      await interaction.deferReply({ ephemeral: true })

      const data = (await collections.users.findOne({
        discordId: id,
      })) as WithId<User>

      console.log(data)

      if (data?.coolDownDone && data?.coolDownDone > Date.now()) {
        const minutesLeft = Math.floor((data.coolDownDone - Date.now()) / 60000)
        const minuteWord = minutesLeft === 1 ? 'minute' : 'minutes'
        return interaction.editReply({
          content: `Please wait ${minutesLeft} ${minuteWord} before playing again`,
        })
      }

      if (!data?.assets) {
        return interaction.editReply({
          content: 'You have no AOWLs to select!',
        })
      }

      if (data?.assets?.length) {
        const options = data.assets.map((asset: Asset) => {
          return {
            label: asset.assetName,
            description: 'Select to play',
            value: asset?.assetId?.toString(),
          }
        })

        const row = new MessageActionRow().addComponents(
          new MessageSelectMenu()
            .setCustomId('register-player')
            .setPlaceholder('Select an AOWL to attack')
            .addOptions(options)
        )

        await interaction.editReply({
          content: 'Choose your AOWL',
          components: [row],
        })
      }
    } catch (error) {
      console.log('ERROR SELECTING')
      //@ts-ignore
      console.log(error.requestData)
    }
  },
}
