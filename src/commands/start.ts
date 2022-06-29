import { Interaction, MessageAttachment } from 'discord.js'
import { asyncForEach, resetGame, wait } from '../utils/helpers'
import doEmbed from '../embeds'
import { SlashCommandBuilder } from '@discordjs/builders'
import { game } from '..'
import embedTypes from '../constants/embeds'
import embeds from '../constants/embeds'
import settings from '../settings'
import { collections } from '../database/database.service'
import Player from '../models/player'

module.exports = {
  data: new SlashCommandBuilder()
    .setName('start')
    .setDescription('start When AOWLS Attack'),
  async execute(interaction: Interaction) {
    if (!interaction.isCommand()) return
    const { maxCapacity, userCooldown } = settings

    resetGame()

    if (game?.active || game?.waitingRoom) {
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

    while (playerCount < maxCapacity && game.waitingRoom) {
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

    // Add user cooldown
    const playerArr = Object.values(game.players)
    try {
      asyncForEach(playerArr, async (player: Player) => {
        const coolDownDoneDate = Date.now() + userCooldown * 60000
        await collections.users.findOneAndUpdate(
          { _id: player.userId },
          { $set: { coolDownDone: coolDownDoneDate } }
        )
      })
    } catch (error) {
      console.log(error)
    }
  },
}
