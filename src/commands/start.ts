import {
  Interaction,
  InteractionReplyOptions,
  MessageAttachment,
} from 'discord.js'
import { resetGame, wait } from '../utils/helpers'
import doEmbed from '../embeds'
import { SlashCommandBuilder } from '@discordjs/builders'
import { game } from '..'
import embedTypes from '../constants/embeds'
import settings from '../settings'

module.exports = {
  data: new SlashCommandBuilder()
    .setName('start')
    .setDescription('start When AOWLS Attack'),
  async execute(interaction: Interaction) {
    if (!interaction.isCommand()) return
    const { maxCapacity } = settings

    if (game?.active || game?.waitingRoom) {
      return await interaction.reply({
        content: 'A game is already running',
        ephemeral: true,
      })
    }

    resetGame()

    await interaction.deferReply()

    const file = new MessageAttachment('src/images/main.gif')

    // send embed here
    await interaction.editReply({ files: [file] })

    // Do waiting room
    game.waitingRoom = true
    let playerCount = 0

    game.embed = await interaction.followUp(
      doEmbed(embedTypes.waitingRoom) as InteractionReplyOptions
    )

    while (playerCount < maxCapacity && game.waitingRoom && !game.stopped) {
      try {
        await wait(2000)
        playerCount = Object.values(game.players).length

        !game.stopped &&
          (await game.embed.edit(doEmbed(embedTypes.waitingRoom)))
      } catch (error) {
        // @ts-ignore
        console.log('ERROR', error)
      }
    }

    game.waitingRoom = false

    // Do countdown
    let countDown = 5
    while (countDown > 0 && !game.stopped) {
      await wait(1000)
      const imagePath = `src/images/${countDown}.png`
      const countDownImage = new MessageAttachment(imagePath)
      await interaction.editReply({ files: [countDownImage] })
      countDown--
    }

    if (!game.stopped) {
      // send embed here
      interaction.editReply({ files: [file] })
      // start game
      game.active = true
      game.embed.edit(doEmbed(embedTypes.activeGame))

      // Do Game

      // Add user cooldown
      // const playerArr = Object.values(game.players)
      // try {
      //   asyncForEach(playerArr, async (player: Player) => {
      //     const coolDownDoneDate = Date.now() + userCooldown * 60000
      //     await collections.users.findOneAndUpdate(
      //       { _id: player.userId },
      //       { $set: { coolDownDone: coolDownDoneDate } }
      //     )
      //   })
      // } catch (error) {
      //   console.log(error)
      // }
    }
  },
}
