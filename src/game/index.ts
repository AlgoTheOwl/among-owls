// Discord
import {
  AttachmentBuilder,
  SelectMenuBuilder,
  MessageOptions,
  ActionRowBuilder,
  TextChannel,
} from 'discord.js'
// Helpers
import { randomSort, wait } from '../utils/helpers'
import { resetGame } from '../utils/gameplay'
import doEmbed from '../embeds'
import runGame from './runGame'
// Globals
import { games } from '..'
// Schemas
import embeds from '../constants/embeds'
import Player, { KeyedPlayers } from '../models/player'
import { getSettings } from '../utils/settings'

/**
 * Starts waiting room in specific channel
 * Watches for updates to game states and edits embed
 * Sends "megatron" image to channel before embed
 * @param channel {TextChannel}
 */
export const startWaitingRoom = async (channel: TextChannel): Promise<void> => {
  const { id: channelId } = channel
  const game = games[channelId]
  const { maxCapacity } = await getSettings(channelId)
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

  const randomlySortedPlayerArr = randomSort(Object.values(game.players))

  runGame(channel, randomlySortedPlayerArr)
}

/**
 * Sends select menu with other players to users to select random or specific victim
 * @param players KeyedPlayers
 * @param channel
 */
const sendVictimSelectMenu = async (
  players: KeyedPlayers,
  channel: TextChannel
) => {
  const playerArr = Object.values(players)

  const victims = playerArr
    .filter((player: Player) => !player.dead)
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
