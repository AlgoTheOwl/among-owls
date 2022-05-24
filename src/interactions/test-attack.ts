import { Interaction, MessageAttachment } from 'discord.js'
import Game from '../models/game'
import User from '../models/user'
import doAttackCanvas from '../canvas/attackCanvas'
import { handleRolledRecently, mapPlayersForEmbed } from '../utils/helpers'
import { EmbedData } from '../types/game'
import doEmbed from '../embeds'
import { wait } from '../utils/helpers'

// Settings
const coolDownInterval = 1000
const messageDeleteInterval = 5000

export default async function doTestAttack(
  interaction: Interaction,
  game: Game,
  hp: number
) {
  if (!interaction.isCommand()) return
  if (!game?.active) return interaction.reply(`Game is not running`)

  const victim: User = Object.values(game.players)[0]
  const attacker: User = Object.values(game.players)[1]

  if (game.rolledRecently.has(attacker.discordId)) {
    return await interaction.reply({
      content: 'Ah ah, still cooling down - wait your turn!',
      ephemeral: true,
    })
  }

  if (victim && attacker) {
    const { asset, username: victimName } = victim
    const { username: attackerName } = attacker
    const damage = Math.floor(Math.random() * (hp / 4))
    victim.hp -= damage

    // do canvas with attacker, hp drained and victim
    const canvas = await doAttackCanvas(damage, asset, victimName, attackerName)

    const attachment = new MessageAttachment(
      canvas.toBuffer('image/png'),
      'attacker.png'
    )

    await interaction.reply({
      files: [attachment],
      content: `${victim.username} gets wrecked by ${attacker.asset.assetName} for ${damage} damage`,
    })

    handleRolledRecently(attacker, game, coolDownInterval)

    const playerArr = Object.values(game.players)
    const embedData: EmbedData = {
      fields: mapPlayersForEmbed(playerArr),
      color: 'RED',
    }

    await game.embed.edit(doEmbed(embedData))
    await wait(messageDeleteInterval)
    await interaction.deleteReply()
  }
}
