// Library
import {
  Client,
  Intents,
  Interaction,
  Collection,
  SelectMenuInteraction,
} from 'discord.js'
import fs from 'node:fs'
import path from 'node:path'
import { connectToDatabase } from './database/database.service'
import settings from './settings'
import Game from './models/game'
import { Intervals } from './types/game'

const token: string = process.env.DISCORD_TOKEN

const { coolDownInterval } = settings

// Gloval vars
export let game: Game = new Game({}, false, false, coolDownInterval)
export let emojis = {}
export const playerTimeouts: { [key: string]: ReturnType<typeof setTimeout> } =
  {}

export const intervals: Intervals = {
  timeoutInterval: null,
  playerTimeouts: {},
}

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
  // load emojis into gamej

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
})

/*
 *****************
 * COMMAND SERVER *
 *****************
 */

client.on(
  'interactionCreate',
  async (interaction: Interaction | SelectMenuInteraction) => {
    let command
    if (interaction.isCommand()) {
      command = client.commands.get(interaction.commandName)
    }
    if (interaction.isSelectMenu()) {
      command = client.commands.get(interaction.customId)
    }

    if (!command) return

    try {
      await command.execute(interaction)
    } catch (error) {
      console.error(error)
    }
  }
)

/*
 *****************
 **** HELPERS ****
 *****************
 */

client.login(token)
