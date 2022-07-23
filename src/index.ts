// Library
import {
  Client,
  Intents,
  Interaction,
  Collection,
  SelectMenuInteraction,
  ButtonInteraction,
} from 'discord.js'
import fs from 'node:fs'
import path from 'node:path'
import { connectToDatabase } from './database/database.service'
import settings from './settings'
import Game from './models/game'

const token: string = process.env.DISCORD_TOKEN

const { coolDownInterval } = settings

// Gloval vars
export let game: Game = new Game({}, false, false, coolDownInterval)
export let emojis = {}

const client: Client = new Client({
  restRequestTimeout: 60000,
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_EMOJIS_AND_STICKERS,
    Intents.FLAGS.GUILD_MEMBERS,
    Intents.FLAGS.GUILD_MESSAGES,
  ],
})

client.once('ready', async () => {
  await connectToDatabase()
  console.log('Ye Among AOWLs - Server ready')

  // loop through configs
  // for each config
  // message channel with embed

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
  async (
    interaction: Interaction | SelectMenuInteraction | ButtonInteraction
  ) => {
    let command
    if (interaction.isCommand()) {
      // ensure two games can't start simultaneously
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
  }
)

client.on('message', async () => {})

client.login(token)
