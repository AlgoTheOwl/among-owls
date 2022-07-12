import { SlashCommandBuilder } from '@discordjs/builders'
import { Interaction } from 'discord.js'
import { WithId } from 'mongodb'
import { collections } from '../database/database.service'
import User from '../models/user'
import { claimHoot } from '../utils/algorand'

module.exports = {
  data: new SlashCommandBuilder()
    .setName('claim')
    .setDescription('claim your hoot!'),
  enabled: true,
  async execute(interaction: Interaction) {
    if (!interaction.isCommand()) return

    const { user } = interaction

    await interaction.deferReply({ ephemeral: true })

    const userData = (await collections.users.findOne({
      discordId: user.id,
    })) as WithId<User>

    if (!userData) {
      return interaction.editReply({
        content: 'You are not in the database',
      })
    }

    const { hoot, address } = userData

    if (!hoot) {
      return interaction.editReply({
        content: 'You have no hoot to claim',
      })
    }

    const status = await claimHoot(hoot, address)
    console.log(status)
    // if (status) {
    //   return interaction.editReply(
    //     `Congrats, you've just received ${hoot} $HOOT!`
    //   )
    // } else {
    //   return interaction.editReply(
    //     'Something went wrong with your claim :( - please try again'
    //   )
    // }
  },
}
