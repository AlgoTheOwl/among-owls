// Discord
import {
  AttachmentBuilder,
  SelectMenuBuilder,
  MessageOptions,
  ActionRowBuilder,
  TextChannel,
} from 'discord.js'
// Helpers
import { resetGame, wait } from '../utils/helpers'
import doEmbed from '../embeds'
import runGame from './runGame'
// Globals
import settings from '../settings'
import { games } from '..'
// Schemas
import embeds from '../constants/embeds'
import Player from '../models/player'

export const startWaitingRoom = async (channel: TextChannel): Promise<void> => {
  const { id: channelId } = channel
  const game = games[channelId]
  const { maxCapacity } = settings[channelId]
  let capacity = maxCapacity

  resetGame(false, channelId)

  game.megatron = await channel.send(
    doEmbed(embeds.waitingRoom, channelId) as MessageOptions
  )
  // Do waiting room
  game.waitingRoom = true
  let playerCount = 0
  const getPlayerCount = () => Object.values(game.players).length

  while (playerCount < capacity && game.waitingRoom) {
    if (game.update) {
      await game.megatron.edit(doEmbed(embeds.waitingRoom, channelId))
      playerCount = getPlayerCount()
    }
    await wait(1000)
  }

  if (game.waitingRoom) game.waitingRoom = false

  await wait(2000)

  const file = new AttachmentBuilder('src/images/main.gif')

  if (game.megatron) {
    await game.megatron.edit({
      files: [file],
      embeds: [],
      components: [],
      fetchReply: true,
    })
  }

  // start game
  game.active = true
  game.arena = await channel.send(
    doEmbed(embeds.activeGame, channelId) as MessageOptions
  )

  await sendVictimSelectMenu(game.players, channel)

  runGame(channel)
}

const sendVictimSelectMenu = async (
  players: { [key: string]: Player },
  channel: TextChannel
) => {
  const playerArr = Object.values(players)

  const victims = playerArr
    .filter((player: Player) => !player.timedOut && !player.dead)
    .map((player: Player) => ({
      label: `Attack ${player.username}`,
      description: ' ',
      value: player.discordId,
    }))

  const victimSelectMenu = new ActionRowBuilder().addComponents(
    new SelectMenuBuilder()
      .setCustomId('select-victim')
      .setPlaceholder('Attack a random victim')
      .addOptions([
        {
          label: `Attack a random victim`,
          description: ' ',
          value: 'random',
        },
        ...victims,
      ])
  )

  await channel.send({
    //@ts-ignore
    components: [victimSelectMenu],
  })
}
