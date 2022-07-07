import {
  ButtonInteraction,
  Interaction,
  InteractionReplyOptions,
  InteractionResponseType,
  MessageAttachment,
} from 'discord.js'
import { resetGame, confirmRole, wait } from '../utils/helpers'
import { game } from '..'
import doEmbed from '../embeds'
import embeds from '../constants/embeds'
import settings from '../settings'

const roleId = process.env.ADMIN_ID

export default async function start(
  interaction: Interaction | ButtonInteraction
) {
  if (!interaction.isCommand() && !interaction.isButton()) return

  const { maxCapacity } = settings
  let capacity = maxCapacity

  const { user } = interaction

  if (interaction.isCommand()) {
    capacity = interaction.options.getNumber('capacity') as number
    const hasRole = await confirmRole(roleId, interaction, user.id)
    if (!hasRole) {
      return await interaction.reply({
        content: 'Only administrators can use this command',
        ephemeral: true,
      })
    }
  }

  resetGame()

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

  game.embed = await interaction.followUp(
    doEmbed(embeds.waitingRoom) as InteractionReplyOptions
  )

  while (playerCount < capacity) {
    try {
      await wait(2000)
      playerCount = Object.values(game.players).length
      await game.embed.edit(doEmbed(embeds.waitingRoom))
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
  game.embed.edit(doEmbed(embeds.activeGame))
}
