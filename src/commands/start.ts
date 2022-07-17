import {
  Interaction,
  InteractionReplyOptions,
  MessageAttachment,
  MessageActionRow,
  MessageSelectMenu,
} from 'discord.js'
import { resetGame, wait } from '../utils/helpers'
import doEmbed from '../embeds'
import { SlashCommandBuilder } from '@discordjs/builders'
import { game } from '..'
import embedTypes from '../constants/embeds'
import settings from '../settings'
import runGame from '../commandUtils/runGame'
import Player from '../models/player'

module.exports = {
  data: new SlashCommandBuilder()
    .setName('start')
    .setDescription('start When AOWLS Attack'),
  enabled: true,
  async execute(interaction: Interaction) {
    if (!interaction.isCommand()) return
    const { maxCapacity, waitingRoomRefreshRate } = settings

    resetGame()

    await interaction.deferReply()

    /*
     ************
     * MEGATRON *
     ************
     */
    const file = new MessageAttachment('src/images/main.gif')
    await interaction.editReply({ files: [file] })

    /*
     ****************
     * WAITING ROOM *
     ****************
     */
    game.waitingRoom = true
    let playerCount = 0

    game.embed = await interaction.followUp(
      doEmbed(embedTypes.waitingRoom) as InteractionReplyOptions
    )

    while (playerCount < maxCapacity && game.waitingRoom && !game.stopped) {
      try {
        await wait(waitingRoomRefreshRate)
        playerCount = Object.values(game.players).length

        !game.stopped &&
          (await game.embed.edit(doEmbed(embedTypes.waitingRoom)))
      } catch (error) {
        // @ts-ignore
        console.log('ERROR', error)
      }
    }

    game.waitingRoom = false

    /*
     *************
     * COUNTDOWN *
     *************
     */
    let countDown = 5
    while (countDown > 0 && !game.stopped) {
      await wait(1000)
      const imagePath = `src/images/${countDown}.png`
      const countDownImage = new MessageAttachment(imagePath)
      await interaction.editReply({ files: [countDownImage] })
      countDown--
    }

    /*
     ***************
     * ACTIVE GAME *
     ***************
     */
    if (!game.stopped) {
      interaction.editReply({ files: [file] })
      game.embed.edit(doEmbed(embedTypes.activeGame))
      game.active = true

      // Do Game
      runGame(interaction)

      // Send Victim Select Menu
      const playerArr = Object.values(game.players)

      const victims = playerArr
        .filter((player: Player) => !player.timedOut && !player.dead)
        .map((player: Player) => ({
          label: `Attack ${player.username}`,
          description: '',
          value: player.discordId,
        }))

      const victimSelectMenu = new MessageActionRow().addComponents(
        new MessageSelectMenu()
          .setCustomId('select-victim')
          .setPlaceholder('Attack a random victim')
          .addOptions([
            {
              label: `Attack a random victim`,
              description: '',
              value: 'random',
            },
            ...victims,
          ])
      )

      interaction.followUp({
        components: [victimSelectMenu],
      })
    }
  },
}
