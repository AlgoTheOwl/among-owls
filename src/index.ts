import User from './models/user'
import { Client, Intents, Interaction } from 'discord.js'
import {
  addRole,
  asyncForEach,
  getNumberSuffix,
  wait,
  getPlayerArray,
  mapPlayersForEmbed,
  handleWin,
} from './utils/helpers'
import { processRegistration } from './interactions/register'
import { connectToDatabase } from './database/database.service'
import Game from './models/game'
import mockUsers from './mocks/users'
import startGame from './interactions/start'
import attack from './interactions/attack'
import { DISCORD_ROLES } from './constants/roles'
import { collections } from './database/database.service'
import { EmbedData } from './types/game'
import { WithId } from 'mongodb'
import doEmbed from './embeds'

const token: string = process.env.DISCORD_TOKEN

// Gloval vars
export let game: Game
export let emojis = {}

// Settings
const hp = 1000
const imageDir = 'dist/nftAssets'
let kickPlayerInterval: ReturnType<typeof setInterval>
const kickPlayerTimeout = 2000

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
    if (gameState) {
      game = gameState
      await handlePlayerTimeout(interaction)
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
    if (!game?.active)
      return interaction.reply({
        content: 'Game is not currently running',
        ephemeral: true,
      })
    game.active = false
    await clearInterval(kickPlayerInterval)
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

  if (commandName === 'leaderboard') {
    const winningUsers = (await collections.users
      .find({ yaoWins: { $gt: 0 } })
      .sort({ yaoWins: 'desc' })
      .toArray()) as WithId<User>[]

    if (winningUsers.length) {
      const embedData: EmbedData = {
        title: 'Leaderboard',
        description: 'Which AOWLs rule them all?',
        image: undefined,
        fields: winningUsers.map((user, i) => {
          //@ts-ignore
          // const numberWithSuffix = getNumberSuffix(user.yaoWins)
          const place = i + 1
          const win = user.yaoWins === 1 ? 'win' : 'wins'
          return {
            name: `#${place}: ${user.username}`,
            value: `${user.yaoWins} ${win}`,
          }
        }),
      }
      await interaction.reply(doEmbed(embedData))
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

/*
 *****************
 * TEST COMMANDS *
 *****************
 */

const handlePlayerTimeout = async (interaction: Interaction) => {
  if (!interaction.isCommand()) return
  await wait(20000)
  kickPlayerInterval = setInterval(async () => {
    if (game.active) {
      getPlayerArray(game.players).forEach((player) => {
        if (!player.rolledRecently) {
          delete game?.players[player.discordId]
        }
      })
      const playerArr = getPlayerArray(game.players)

      if (playerArr.length === 1) {
        return handleWin(playerArr, interaction)
      }

      if (playerArr.length) {
        const embedData: EmbedData = {
          fields: mapPlayersForEmbed(getPlayerArray(game.players)),
          image: undefined,
        }
        return game.embed.edit(doEmbed(embedData))
      }

      const embedData: EmbedData = {
        image: undefined,
        title: 'BOOOO',
        description:
          'Game has ended due to all players being removed for inactivity',
      }
      game.embed.edit(doEmbed(embedData))
      game.active = false
      clearInterval(kickPlayerInterval)
    }
  }, kickPlayerTimeout)
}

client.login(token)
