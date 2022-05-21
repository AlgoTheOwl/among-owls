import User from './models/user'
import doEmbed from './database/embeds'
import { Client, Intents, Interaction, MessageAttachment } from 'discord.js'
import { asyncForEach, wait } from './utils/helpers'
import { processRegistration } from './utils/register'
import { connectToDatabase } from './database/database.service'
import Game from './models/game'
import { EmbedData } from './types/game'
import mockUsers from './mocks/users'
import doAttackCanvas from './canvas/attackCanvas'
import startGame from './interactions/start'
import attack from './interactions/attack'

const token: string = process.env.DISCORD_TOKEN

export let game: Game | undefined

// Settings
const hp = 1000
const imageDir = 'dist/images'
const coolDownInterval = 1000

const client: Client = new Client({
  intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_EMOJIS_AND_STICKERS],
})

client.once('ready', async () => {
  await connectToDatabase()
  console.log('When Owls Attack - Server ready')
})

/*
 *****************
 * COMMAND SERVER *
 *****************
 */

client.on('interactionCreate', async (interaction: Interaction) => {
  if (!interaction.isCommand()) return

  const { commandName, user } = interaction

  if (commandName === 'start') {
    game = await startGame(interaction, hp, imageDir)
  }

  if (commandName === 'attack') {
    if (!game?.active)
      return interaction.reply({
        content: `The game hasn't started yet, please register if you haven't already and try again later`,
        ephemeral: true,
      })
    attack(interaction, game, user, hp)
  }

  if (commandName === 'stop') {
    if (!game?.active) return interaction.reply('Game is not currently running')
    game.active = false
    return interaction.reply({ content: 'Game stopped', ephemeral: true })
  }

  /*
   *****************
   * TEST COMMANDS *
   *****************
   */

  // test registring and selecting players
  if (commandName === 'setup-test') {
    await asyncForEach(mockUsers, async (user: User, i: number) => {
      await processRegistration(user)
      console.log(`test user ${i + 1} added`)
    })
  }

  // test pushing attack event to que
  if (commandName === 'attack-test') {
    // interaction.deferReply({ ephemeral: true })

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
      const damage = Math.floor(Math.random() * (hp / 2))
      victim.hp -= damage

      // do canvas with attacker, hp drained and victim
      const canvas = await doAttackCanvas(
        damage,
        asset,
        victimName,
        attackerName
      )

      const attachment = new MessageAttachment(
        canvas.toBuffer('image/png'),
        'attacker.png'
      )

      await interaction.reply({ files: [attachment] })

      handleRolledRecently(attacker)

      const embedData: EmbedData = {
        title: 'When Owls Attack',
        description: 'Who will survive?',
        color: 'DARK_AQUA',
        fields: Object.values(game.players).map((player) => ({
          name: player.username,
          value: `${player.asset.unitName} - ${player.hp}`,
        })),
      }

      game.embed.edit(doEmbed(embedData))
      await wait(5000)
      interaction.deleteReply()
    }
  }
})

const handleRolledRecently = (user: User) => {
  game?.rolledRecently.add(user.discordId)

  setTimeout(() => {
    game?.rolledRecently.delete(user.discordId)
  }, coolDownInterval + 1500)
}

client.login(token)
