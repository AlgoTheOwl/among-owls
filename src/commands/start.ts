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
    .setDescription('start When AOWLS Attack'),
  async execute(interaction: Interaction) {
    if (!interaction.isCommand()) return

    const { user } = interaction

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

    const waitingRoomEmbedData: EmbedData = {
      image: undefined,
      title: 'Waiting Room',
      description: '0 players have joined the game',
      isWaitingRoom: true,
    }

    game.embed = await interaction.followUp(doEmbed(waitingRoomEmbedData))

    while (playerCount < minimumPlayers) {
      try {
        await wait(2000)
        playerCount = Object.values(game.players).length

        await game.embed.edit(
          doEmbed({
            ...waitingRoomEmbedData,
            description: `${playerCount} ${
              playerCount === 1 ? 'player' : 'players'
            } have joined the game`,
          })
        )
      } catch (error) {
        // @ts-ignore
        console.log('ERROR', error)
      }
    }

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
