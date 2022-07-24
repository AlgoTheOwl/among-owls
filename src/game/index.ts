// Discord
import {
  MessageAttachment,
  MessageSelectMenu,
  MessageActionRow,
  MessageOptions,
} from 'discord.js'
// Helpers
import { resetGame, wait } from '../utils/helpers'
import doEmbed from '../embeds'
import runGame from './runGame'
// Globals
import settings from '../settings'
import { game, channel } from '..'
// Schemas
import embeds from '../constants/embeds'
import Player from '../models/player'

export const startWaitingRoom = async (): Promise<void> => {
  const { maxCapacity } = settings
  let capacity = maxCapacity

  resetGame()

  game.megatron = await channel.send(
    doEmbed(embeds.waitingRoom) as MessageOptions
  )
  // Do waiting room
  game.waitingRoom = true
  let playerCount = 0
  const getPlayerCount = () => Object.values(game.players).length

  while (playerCount < capacity && game.waitingRoom) {
    if (game.update) {
      await game.megatron.edit(doEmbed(embeds.waitingRoom))
    }
    await wait(1000)
  }

  if (game.waitingRoom) game.waitingRoom = false

  // Do countdown
  let countDown = 5
  while (countDown >= 1) {
    await sendCountdown(countDown, channel)
    countDown--
    await wait(1000)
  }

  const file = new MessageAttachment('src/images/main.gif')
  await game.megatron.edit({ files: [file], embeds: [], components: [] })

  // start game
  game.active = true
  game.arena = await channel.send(doEmbed(embeds.activeGame) as MessageOptions)

  await sendVictimSelectMenu()

  runGame()
}

const sendCountdown = async (countDown: number, channel: any) => {
  const imagePath = `src/images/${countDown}.png`
  const countDownImage = new MessageAttachment(imagePath)

  if (!game.megatron) {
    game.megatron = await channel.send({
      files: [countDownImage],
    })
  } else {
    game.megatron.edit({ files: [countDownImage] })
  }
}

const sendVictimSelectMenu = async () => {
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

  await channel.send({
    components: [victimSelectMenu],
  })
}
