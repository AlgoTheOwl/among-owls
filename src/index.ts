import User from './models/user'
import doEmbed from './embeds'
import {
  Client,
  Intents,
  Interaction,
  MessageAttachment,
  Permissions,
} from 'discord.js'
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
export let emojis = {}

// Settings
const hp = 1000
const imageDir = 'dist/images'
const coolDownInterval = 1000
const messageDeleteInterval = 8000

const client: Client = new Client({
  intents: [
    Intents.FLAGS.GUILD_MEMBERS,
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_EMOJIS_AND_STICKERS,
  ],
})

// const permissions = new Permissions([Permissions.FLAGS.MANAGE_ROLES])

client.once('ready', async () => {
  await connectToDatabase()
  console.log('When AOWLS Attack - Server ready')
  // load emojis into game
})

/*
 *****************
 * COMMAND SERVER *
 *****************
 */

client.on('interactionCreate', async (interaction: Interaction) => {
  if (!interaction.isCommand()) return

  const { commandName, user, options } = interaction

  if (commandName === 'start') {
    try {
      game = await startGame(interaction, hp, imageDir)
    } catch (error) {
      console.log(error)
    }
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

  if (commandName === 'register') {
    const address = options.getString('address')
    const assetId = options.getNumber('assetid')

    const { username, id } = user

    if (address && assetId) {
      const registrant = new User(username, id, address, { assetId }, hp)
      const { status, registeredUser } = await processRegistration(registrant)

      // add permissions if succesful
      if (registeredUser) {
        try {
          const role = interaction.guild?.roles.cache.find(
            (role) => role.name === 'registered'
          )
          const member = interaction.guild?.members.cache.find(
            (member) => member.id === id
          )
          role && (await member?.roles.add(role.id))
        } catch (error) {
          console.log('ERROR adding role', error)
        }
      }

      await interaction.reply({ ephemeral: true, content: status })
    }
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
      const damage = Math.floor(Math.random() * (hp / 4))
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

      await interaction.reply({
        files: [attachment],
        content: `${victim.username} gets wrecked by ${attacker.asset.assetName} for ${damage} damage`,
        // ephemeral: true,
      })

      handleRolledRecently(attacker)

      const embedData: EmbedData = {
        title: 'When AOWLS Attack',
        description: 'Who will survive?',
        color: 'DARK_AQUA',
        thumbNail:
          'https://external-content.duckduckgo.com/iu/?u=http%3A%2F%2Fweirdlystrange.com%2Fwp-content%2Fuploads%2F2015%2F12%2Fowl004.jpg&f=1&nofb=1',
        fields: Object.values(game.players).map((player) => ({
          name: player.username,
          value: `${player.asset.assetName} - HP: ${player.hp}`,
        })),
      }

      await game.embed.edit(doEmbed(embedData))
      await wait(messageDeleteInterval)
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
