import User from './models/user'
import { Client, Intents, Interaction, Permissions } from 'discord.js'
import { asyncForEach } from './utils/helpers'
import { processRegistration } from './interactions/register'
import { connectToDatabase } from './database/database.service'
import Game from './models/game'
import mockUsers from './mocks/users'
import startGame from './interactions/start'
import attack from './interactions/attack'

const token: string = process.env.DISCORD_TOKEN

// Gloval vars
export let game: Game | undefined
export let emojis = {}

// Settings
const hp = 1000
const imageDir = 'dist/images'

const client: Client = new Client({
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_EMOJIS_AND_STICKERS,
    Intents.FLAGS.GUILD_MEMBERS,
  ],
})

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
    const gameState = await startGame(interaction, hp, imageDir)
    if (gameState) game = gameState
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
      const registrant = new User(username, id, address, { assetId }, hp, 0)
      const { status, registeredUser } = await processRegistration(
        registrant,
        false
      )
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
  if (commandName === 'test-register') {
    await asyncForEach(mockUsers, async (user: User, i: number) => {
      const { status, registeredUser } = await processRegistration(user, true)
      if (registeredUser) console.log(`test user ${i + 1} added`)
      else console.log(status)
    })

    await interaction.reply({
      content: 'all test users added',
    })
  }
})

client.login(token)
