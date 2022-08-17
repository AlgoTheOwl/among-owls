// Discord
import {
  Client,
  GatewayIntentBits,
  TextChannel,
  InteractionType,
  Collection,
} from 'discord.js'
// Node
import fs from 'node:fs'
import path from 'node:path'
// Helpers
import { connectToDatabase } from './database/database.service'
// Globals
import settings from './settings'
// Schema
import Game from './models/game'
// Helpers
import { startWaitingRoom } from './game'
import { convergeTxnData } from './utils/algorand'
import { wait, asyncForEach } from './utils/helpers'

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

client.once('ready', async () => {
  try {
    main()
  } catch (error) {
    console.log('CLIENT ERROR', error)
    wait(3000)
    main()
  }
})

const main = async () => {
  await connectToDatabase()
  console.log('Ye Among AOWLs - Server ready')

  let update = true
  if (!fs.existsSync('dist/txnData/txnData.json')) {
    update = false
    fs.writeFileSync('dist/txnData/txnData.json', '')
  }

  const txnData = await convergeTxnData(creatorAddressArr, update)

  fs.writeFileSync('dist/txnData/txnData.json', JSON.stringify(txnData))

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

  const channelIdArr = Object.keys(settings)

  // start game for each channel
  asyncForEach(channelIdArr, async (channelId: string) => {
    if (settings[channelId]) {
      const channel = client.channels.cache.get(channelId) as TextChannel
      const { maxCapacity } = settings[channelId]
      games[channelId] = new Game({}, false, false, maxCapacity, channelId)
      startWaitingRoom(channel)
    } else {
      console.log(`missing settings for channel ${channelId}`)
    }
  })
}

/*
 *****************
 * COMMAND SERVER *
 *****************
 */

client.on('interactionCreate', async (interaction: any) => {
  try {
    let command
    if (interaction.isCommand()) {
      command = client.commands.get(interaction.commandName)
    }
    if (interaction.isSelectMenu() || interaction.isButton()) {
      command = client.commands.get(interaction.customId)
    }
    if (!command) return
    await command.execute(interaction)
  } catch (error) {
    console.log('****** INTERACTION ERROR ******')
  }
})

client.login(token)
