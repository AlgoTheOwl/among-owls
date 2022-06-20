import { Interaction, MessageAttachment } from 'discord.js'
import { wait } from '../utils/helpers'
import { EmbedData } from '../types/game'
import doEmbed from '../embeds'
import { mapPlayersForEmbed } from '../utils/helpers'
import { SlashCommandBuilder } from '@discordjs/builders'
import { confirmRole } from '../utils/helpers'
import { game } from '..'
import settings from '../settings'

const { minimumPlayers } = settings
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

    const { user, options } = interaction
    const capacity = options.getNumber('capacity') || minimumPlayers

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

    const playerWord = playerCount === 1 ? 'player' : 'players'
    const hasWord = playerCount === 1 ? 'has' : 'have'
    const waitingRoomDesc = () =>
      `${playerCount} ${playerWord} ${hasWord} joined the game. \n${capacity} players are required to start this game`

    const waitingRoomEmbedData: EmbedData = {
      image: undefined,
      title: 'Waiting Room',
      description: waitingRoomDesc(),
      isWaitingRoom: true,
    }

    game.embed = await interaction.followUp(doEmbed(waitingRoomEmbedData))

    while (playerCount < capacity) {
      try {
        await wait(2000)
        playerCount = Object.values(game.players).length

        await game.embed.edit(
          doEmbed({
            ...waitingRoomEmbedData,
            description: waitingRoomDesc(),
          })
        )
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

      const embedData: EmbedData = {
        title: 'Ready your AOWLS!',
        description: `Game starting in ${countDown}...`,
      }
      await game.embed.edit(doEmbed(embedData))
    }

    const playerArr = Object.values(game.players)

    // send back game embed
    const embedData: EmbedData = {
      image: undefined,
      fields: mapPlayersForEmbed(playerArr),
      description: 'Leaderboard',
      isMain: true,
    }
    // start game
    game.active = true
    game.embed.edit(doEmbed(embedData))
  },
}
