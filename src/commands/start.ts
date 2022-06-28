import { Interaction, MessageAttachment } from 'discord.js'
import { resetGame, wait } from '../utils/helpers'
import doEmbed from '../embeds'
import { SlashCommandBuilder } from '@discordjs/builders'
import { confirmRole } from '../utils/helpers'
import { game } from '..'
import embedTypes from '../constants/embeds'
import embeds from '../constants/embeds'

const roleId: string = process.env.ADMIN_ID

module.exports = {
  data: new SlashCommandBuilder()
    .setName('start')
    .setDescription('start When AOWLS Attack')
    .addNumberOption((option) =>
      option
        .setName('capacity')
        .setDescription('max amount of players allowed in a single game')
        .setRequired(true)
    ),
  async execute(interaction: Interaction) {
    if (!interaction.isCommand()) return

    resetGame()
    const { user, options } = interaction
    const capacity = options.getNumber('capacity') as number
    const hasRole = await confirmRole(roleId, interaction, user.id)

    if (!hasRole) {
      return await interaction.reply({
        content: 'Only administrators can use this command',
        ephemeral: true,
      })
    }

    if (game?.active) {
      return await interaction.reply({
        content: 'A game is already running',
        ephemeral: true,
      })
    }

    await interaction.deferReply()

    const file = new MessageAttachment('src/images/main.gif')

    // send embed here
    await interaction.editReply({ files: [file] })

    // Do waiting room
    game.waitingRoom = true
    let playerCount = 0

    game.embed = await interaction.followUp(doEmbed(embedTypes.waitingRoom))

    while (playerCount < capacity) {
      try {
        await wait(2000)
        playerCount = Object.values(game.players).length

        await game.embed.edit(doEmbed(embedTypes.waitingRoom))
      } catch (error) {
        // @ts-ignore
        console.log('ERROR', error)
      }
    }

    game.waitingRoom = false

    // Do countdown
    let countDown = 5
    while (countDown >= 1) {
      countDown--
      await wait(1000)
      await game.embed.edit(doEmbed(embeds.countDown, { countDown }))
    }

    // start game
    game.active = true
    game.embed.edit(doEmbed(embedTypes.activeGame))
  },
}
