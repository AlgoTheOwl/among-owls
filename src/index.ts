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
const channelIds = process.env.CHANNEL_IDS

// Gloval vars
export let games: { [key: string]: Game }
export let emojis = {}
export let channel: TextChannel
const channelIdArr = channelIds.split(',')

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

  // start game for each channel
  asyncForEach(channelIdArr, async (channelId: string) => {
    const channel = client.channels.cache.get(channelId) as TextChannel
    const { maxCapacity } = settings[channelId]
    games[channelId] = new Game({}, false, false, maxCapacity, channelId)
    startWaitingRoom(channel)
  })
}

/*
 *****************
 * COMMAND SERVER *
 *****************
 */

client.on('interactionCreate', async (interaction: any) => {
  let command
  if (interaction.type === InteractionType.ApplicationCommand) {
    // ensure two games can't start simultaneously
    const { channelId } = interaction
    const game = games[channelId]
    if (
      (game?.active || game?.waitingRoom) &&
      interaction.commandName === 'start'
    ) {
      return await interaction.reply({
        content: 'A game is already running',
        ephemeral: true,
      })
    }

    command = client.commands.get(interaction.commandName)
  }
  if (interaction.isSelectMenu() || interaction.isButton()) {
    command = client.commands.get(interaction.customId)
  }
  if (!command) return

  try {
    await command.execute(interaction)
  } catch (error) {
    console.error(error)
  }
})

client.login(token)
