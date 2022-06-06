import User from './models/user'
import { Client, Intents, Interaction } from 'discord.js'
import {
  addRole,
  asyncForEach,
  wait,
  getPlayerArray,
  mapPlayersForEmbed,
  handleWin,
  confirmRole,
  getWinningPlayer,
} from './utils/helpers'
import { processRegistration } from './interactions/register'
import { connectToDatabase } from './database/database.service'
import Game from './models/game'
import Player from './models/player'
import mockUsers from './mocks/users'
import startGame from './interactions/start'
import attack from './interactions/attack'
import { collections } from './database/database.service'
import { EmbedData } from './types/game'
import { WithId } from 'mongodb'
import doEmbed from './embeds'

const token: string = process.env.DISCORD_TOKEN
const roleId: string = process.env.ADMIN_ID

// Gloval vars
export let game: Game = new Game({}, false, false, 0)
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
    const hasRole = await confirmRole(roleId, interaction, user.id)
    if (!hasRole) {
      return await interaction.reply({
        content: 'Only administrators can use this command',
        ephemeral: true,
      })
    }

    const gameState = await startGame(interaction, hp, imageDir)
    if (gameState) {
      game = gameState
    }
  }

  if (commandName === 'attack') {
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

  if (commandName === 'stop') {
    const hasRole = await confirmRole(roleId, interaction, user.id)
    if (!hasRole) {
      return await interaction.reply({
        content: 'Only administrators can use this command',
        ephemeral: true,
      })
    }
    if (!game?.active)
      return interaction.reply({
        content: 'Game is not currently running',
        ephemeral: true,
      })
    game.active = false
    clearInterval(kickPlayerInterval)
    return interaction.reply({ content: 'Game stopped', ephemeral: true })
  }

  if (commandName === 'register') {
    if (game?.active) {
      return interaction.reply({
        content: 'Please wait until after the game ends to register',
        ephemeral: true,
      })
    }
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
        addRole(interaction, process.env.REGISTERED_ID, registeredUser)
      }

      await interaction.reply({
        ephemeral: registeredUser ? false : true,
        content: status,
      })
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
  if (commandName === 'test-register') {
    const hasRole = await confirmRole(roleId, interaction, user.id)
    if (!hasRole) {
      return await interaction.reply({
        content: 'Only administrators can use this command',
        ephemeral: true,
      })
    }
    await asyncForEach(mockUsers, async (player: any, i: number) => {
      const { username, discordId, address, assetId } = player
      await processRegistration(
        username,
        discordId,
        address,
        assetId,
        'yao',
        hp
      )
    })

    await interaction.reply({
      content: 'all test users added',
      ephemeral: true,
    })
  }
})

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
          // delete game?.players[player.discordId]
          game.players[player.discordId].timedOut = true
        }
      })

      const playerArr = getPlayerArray(game.players)

      const winningPlayer: Player | undefined = getWinningPlayer(playerArr)

      if (winningPlayer && game.active) {
        clearInterval(kickPlayerInterval)
        return handleWin(winningPlayer, interaction)
      }

      const usersTimedOut = playerArr.filter((player) => player.timedOut)

      if (!playerArr.length || playerArr.length === usersTimedOut.length) {
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
