import { Interaction, MessageAttachment } from 'discord.js'
import Game from '../models/game'
import User from '../models/user'
import doAttackCanvas from '../canvas/attackCanvas'
import { handleRolledRecently } from '../utils/helpers'
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

    const embedData: EmbedData = {
      title: '🔥🦉🔥 When AOWLS Attack 🔥🦉🔥',
      description: '💀 Who will survive? 💀',
      color: 'RED',
      image:
        'https://external-content.duckduckgo.com/iu/?u=http%3A%2F%2Fweirdlystrange.com%2Fwp-content%2Fuploads%2F2015%2F12%2Fowl004.jpg&f=1&nofb=1',
      thumbNail:
        'https://www.randgallery.com/wp-content/uploads/2021/11/owl.jpg',
      fields: Object.values(game.players).map((player) => ({
        name: player.username,
        value: `${player.asset.assetName} - HP: ${player.hp}`,
      })),
      footer: {
        text: 'test footer content',
        iconUrl:
          'https://www.randgallery.com/wp-content/uploads/2021/11/owl.jpg',
      },
    }

    await game.embed.edit(doEmbed(embedData))
    await wait(messageDeleteInterval)
    await interaction.deleteReply()
  }
}
