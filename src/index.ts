import {
  Client,
  Intents,
  Interaction,
  Collection,
  SelectMenuInteraction,
} from 'discord.js'
import {
  wait,
  getPlayerArray,
  mapPlayersForEmbed,
  handleWin,
  getWinningPlayer,
} from './utils/helpers'
import { connectToDatabase } from './database/database.service'
import attack from './interactions/attack'
import { EmbedData } from './types/game'
import doEmbed from './embeds'
import fs from 'node:fs'
import path from 'node:path'
import settings from './settings'
import Game from './models/game'

const token: string = process.env.DISCORD_TOKEN

const { hp, kickPlayerTimeout, coolDownInterval } = settings
// Gloval vars
export let game: Game = new Game({}, false, false, coolDownInterval)
export let emojis = {}
export let kickPlayerInterval: ReturnType<typeof setInterval>

// Settings

const client: Client = new Client({
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_EMOJIS_AND_STICKERS,
    Intents.FLAGS.GUILD_MEMBERS,
  ],
})

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

client.once('ready', async () => {
  await connectToDatabase()
  console.log('Ye Among AOWLs - Server ready')
  // load emojis into gamej
})

/*
 *****************
 * COMMAND SERVER *
 *****************
 */

client.on(
  'interactionCreate',
  async (interaction: Interaction | SelectMenuInteraction) => {
    if (interaction.isCommand()) {
      const command = client.commands.get(interaction.commandName)

      if (!command) return

      try {
        await command.execute(interaction)
      } catch (error) {
        console.error(error)
        await interaction.reply({
          content: 'There was an error while executing this command!',
          ephemeral: true,
        })
      }
    }

    if (interaction.isSelectMenu()) {
      try {
        if (interaction.customId === 'attack') {
          const { user } = interaction
          if (!game?.active)
            return interaction.reply({
              content: `HOO do you think you are? The game hasn’t started yet!`,
              ephemeral: true,
            })
          if (!game.attackEngaged) {
            handlePlayerTimeout(interaction)
            game.attackEngaged = true
          }
          attack(interaction, game, user, hp)
        }
      } catch (error) {
        console.log(error)
      }
    }
  }
)

/*
 *****************
 **** HELPERS ****
 *****************
 */

const handlePlayerTimeout = async (interaction: Interaction) => {
  if (!interaction.isCommand()) return

  await wait(20000)

  kickPlayerInterval = setInterval(async () => {
    if (game.active) {
      getPlayerArray(game.players).forEach((player) => {
        if (!player.rolledRecently) {
          game.players[player.discordId].timedOut = true
        }
      })

      const playerArr = getPlayerArray(game.players)

      const { winningPlayer, winByTimeout } = getWinningPlayer(playerArr)

      if (winningPlayer && game.active) {
        clearInterval(kickPlayerInterval)
        return handleWin(winningPlayer, interaction, winByTimeout)
      }

      const usersTimedOut = playerArr.filter((player) => player.timedOut)

      if (playerArr.length === usersTimedOut.length) {
        const embedData: EmbedData = {
          image: undefined,
          title: 'BOOOO!!!',
          description:
            'Game has ended due to all players being removed for inactivity',
        }

        game.embed.edit(doEmbed(embedData))
        game.active = false
        return clearInterval(kickPlayerInterval)
      }

      if (playerArr.length) {
        const embedData: EmbedData = {
          fields: mapPlayersForEmbed(getPlayerArray(game.players)),
          image: undefined,
        }
        return game.embed.edit(doEmbed(embedData))
      }
    }
  }, kickPlayerTimeout)
}

client.login(token)
