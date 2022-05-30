import {
  ClientUser,
  Interaction,
  MessageAttachment,
  User as DiscordUser,
} from 'discord.js'
import Game from '../models/game'
import { EmbedData } from '../types/game'
import doEmbed from '../embeds'
import doAttackCanvas from '../canvas/attackCanvas'
import {
  wait,
  handleRolledRecently,
  mapPlayersForEmbed,
} from '../utils/helpers'
import { removeAllPlayers } from '../database/operations'
import { Canvas } from 'canvas'

// Settings
const coolDownInterval = 5000
const messageDeleteInterval = 7000

export default async function attack(
  interaction: Interaction,
  game: Game,
  user: DiscordUser,
  hp: number
) {
  if (!interaction.isCommand()) return
  const { options } = interaction

  const { id: victimId } = options.getUser('victim') as ClientUser
  const { id: attackerId } = user

  if (victimId === attackerId) {
    return interaction.reply({
      content: `Unfortunately, you can't attack yourself, please try again!`,
      ephemeral: true,
    })
  }

  const victim = game.players[victimId] ? game.players[victimId] : null
  const attacker = game.players[attackerId] ? game.players[attackerId] : null

  if (!attacker) {
    return interaction.reply({
      content: 'Please register by using the /register slash command to attack',
      ephemeral: true,
    })
  }

  if (!victim) {
    return interaction.reply({
      content:
        'Intended victim is currently not registered, please try attacking another player',
      ephemeral: true,
    })
  }

  if (attacker.coolDownTimeLeft && attacker.coolDownTimeLeft > 0) {
    return interaction.reply({
      content: `Ah, ah, not your turn yet wait ${
        attacker.coolDownTimeLeft / 1000
      } seconds`,
      ephemeral: true,
    })
  }

  const damage = Math.floor(Math.random() * (hp / 2))
  // const damage = 1000
  victim.hp -= damage

  let victimDead = false
  if (victim.hp <= 0) {
    // if victim is dead, delete from game
    delete game.players[victimId]
    victimDead = true
  }

  const playerArr = Object.values(game.players)
  // if there is only one player left, the game has been won
  if (playerArr.length === 1) {
    const winner = playerArr[0]
    // handle win
    game.active = false

    const embedData: EmbedData = {
      title: 'WINNER!!!',
      description: `${winner.username}'s ${winner.asset.unitName} destroyed the competition`,
      color: 'DARK_AQUA',
      image: winner.asset.assetUrl,
    }

    removeAllPlayers()

    interaction.reply({ ephemeral: true, content: 'You WON!!!' })

    return game.embed.edit(doEmbed(embedData))
  }

  const { username: victimName } = victim
  const { username: attackerName, asset } = attacker

  // do canvas with attacker, hp drained and victim
  const canvas: Canvas = await doAttackCanvas(
    damage,
    asset,
    victimName,
    attackerName
  )

  const attachment = new MessageAttachment(
    canvas.toBuffer('image/png'),
    'attacker.png'
  )

  await interaction.reply({
    files: [attachment],
    content: victimDead
      ? `${attacker.asset.assetName} has eliminated ${victim.username}!!!`
      : `${attacker.asset.assetName} attacks ${victim.username} for ${damage} damage`,
  })

  handleRolledRecently(attacker, coolDownInterval)

  const embedData: EmbedData = {
    color: 'RED',
    fields: mapPlayersForEmbed(playerArr),
  }
  // if lose, remove loser from players and play game again
  await game.embed.edit(doEmbed(embedData))
  await wait(messageDeleteInterval)
  await interaction.deleteReply()
}
