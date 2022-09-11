// Discord
import {
  Client,
  GatewayIntentBits,
  TextChannel,
  Collection,
  InteractionType,
} from 'discord.js'
// Node
import fs from 'node:fs'
import path from 'node:path'
// Helpers
import { connectToDatabase } from './database/database.service'
import { setupTxns } from './utils/algorand'
// Globals
import { collections } from './database/database.service'
// Schema
import Game from './models/game'
// Helpers
import { startWaitingRoom } from './game'
import { wait, asyncForEach } from './utils/helpers'
import { WithId } from 'mongodb'
import { Settings } from './utils/settings'

const token = process.env.DISCORD_TOKEN
const creatorAddressOne = process.env.CREATOR_ADDRESS_ONE
const creatorAddressTwo = process.env.CREATOR_ADDRESS_TWO
const creatorAddressThree = process.env.CREATOR_ADDRESS_THREE

// Gloval vars
export const games: { [key: string]: Game } = {}
export let emojis = {}

export const creatorAddressArr = [
  creatorAddressOne,
  creatorAddressTwo,
  creatorAddressThree,
]

export const client: Client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildEmojisAndStickers,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
  ],
})

/**
 * Listener for server start
 */
client.once('ready', async () => {
  try {
    main()
  } catch (error) {
    console.log('****** CLIENT ERROR ******', error)
    wait(3000)
    main()
  }
})

/**
 * Main game function
 * Connects to db, fetches txnData from blockchain and starts games in specified channels
 */
const main = async () => {
  await connectToDatabase()
  await setupTxns()
  setupCommands()
  startGames()
  console.log('Ye Among AOWLs - Server ready')
}

/**
 * Parses command files and readies them for use in client
 */
const setupCommands = () => {
  client.commands = new Collection()

  const commandsPath = path.join(__dirname, 'commands')
  const commandFiles = fs
    .readdirSync(commandsPath)
    .filter((file) => file.endsWith('.js'))

  for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file)
    const command = require(filePath)
    client.commands.set(command.data.name, command)
  }
}

/**
 * Fetches channel settings from DB
 * Starts game for each object entered
 */
const startGames = async () => {
  const channelSettings = (await collections.settings
    .find({})
    .toArray()) as WithId<Settings>[]

  asyncForEach(channelSettings, async (settings: Settings) => {
    // TODO: Test to make sure each settings object is valid
    const { maxCapacity, channelId } = settings
    const channel = client.channels.cache.get(channelId) as TextChannel
    games[channelId] = new Game({}, false, false, maxCapacity, 0, Date.now())
    startWaitingRoom(channel)
  })
}

/**
 * Main command listener
 */
client.on('interactionCreate', async (interaction: any) => {
  try {
    let command
    if (interaction.type === InteractionType.ApplicationCommand) {
      command = client.commands.get(interaction.commandName)
    }
    if (interaction.isSelectMenu() || interaction.isButton()) {
      command = client.commands.get(interaction.customId)
    }
    if (!command) return
    await command.execute(interaction)
  } catch (error) {
    console.log('****** INTERACTION ERROR ******', error)
  }
})

client.login(token)
