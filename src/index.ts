import User from './models/user'
import { Client, Intents, Interaction } from 'discord.js'
import { addRole, asyncForEach } from './utils/helpers'
import { processRegistration } from './interactions/register'
import { connectToDatabase } from './database/database.service'
import Game from './models/game'
import mockUsers from './mocks/users'
import startGame from './interactions/start'
import attack from './interactions/attack'
import { DISCORD_ROLES } from './constants/roles'

const token: string = process.env.DISCORD_TOKEN

// Gloval vars
export let game: Game | undefined
export let emojis = {}

// Settings
const hp = 1000
const imageDir = 'dist/nftAssets'

const client: Client = new Client({
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_EMOJIS_AND_STICKERS,
    Intents.FLAGS.GUILD_MEMBERS,
  ],
})

client.once('ready', async () => {
  await connectToDatabase()
  console.log('Ye Among AOWLs - Server ready')
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
    if (!game?.active)
      return interaction.reply({
        content: 'Game is not currently running',
        ephemeral: true,
      })
    game.active = false
    return interaction.reply({ content: 'Game stopped', ephemeral: true })
  }

  if (commandName === 'register') {
    // TODO: add ability to register for different games here
    const address = options.getString('address')
    const assetId = options.getNumber('assetid')

    const { username, id } = user

    if (address && assetId) {
      const { status, registeredUser, asset } = await processRegistration(
        username,
        id,
        address,
        assetId,
        'yao',
        hp
      )
      // add permissions if succesful
      if (registeredUser && asset) {
        addRole(interaction, DISCORD_ROLES.registered, registeredUser)
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
  //   if (commandName === 'test-register') {
  //     await asyncForEach(mockUsers, async (user: User, i: number) => {
  //       const { status, registeredUser, asset } = await processRegistration(
  //         user,
  //         true
  //       )
  //       if (registeredUser && asset) {
  //         addRole(interaction, DISCORD_ROLES.registered, registeredUser)
  //       } else {
  //         console.log('status:', status)
  //       }
  //     })

  //     await interaction.reply({
  //       content: 'all test users added',
  //       ephemeral: true,
  //     })
  //   }
})

client.login(token)
