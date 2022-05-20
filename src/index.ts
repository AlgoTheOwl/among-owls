import User from './models/user'
import doEmbed from './services/embeds'
import {
  Client,
  Intents,
  Interaction,
  ColorResolvable,
  ClientUser,
  MessageAttachment,
} from 'discord.js'
import { asyncForEach, downloadFile } from './utils/helpers'
import { processRegistration } from './utils/register'
import { connectToDatabase } from './services/database.service'
import { fetchPlayers } from './services/operations'
import Game from './models/game'
import { EmbedData, AttackEvent } from './types/game'
import { Asset } from './types/user'
import mockUsers from './mocks/users'
import doAttackCanvas from './canvas/attackCanvas'

export let game: Game | undefined
let queInterval

// Settings
const token: string = process.env.DISCORD_TOKEN
const hp = 1000
const eventQue: AttackEvent[] = []
const imageDir = 'dist/images'

const client: Client = new Client({
  intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_EMOJIS_AND_STICKERS],
})

client.once('ready', async () => {
  await connectToDatabase()
  console.log('When Owls Attack - Server ready')
})

client.on('interactionCreate', async (interaction: Interaction) => {
  if (!interaction.isCommand()) return

  const { commandName, options, user } = interaction

  if (commandName === 'start') {
    interaction.deferReply()
    // grab players
    const players: User[] = await fetchPlayers()
    const gamePlayers: { [key: string]: User } = {}
    await asyncForEach(players, async (player: User) => {
      const { username, discordId, address, asset } = player

      // save each image locally for use later
      const localPath = await downloadFile(asset, imageDir, username)

      if (localPath) {
        const assetWithLocalPath: Asset = { ...asset, localPath }

        gamePlayers[discordId] = new User(
          username,
          discordId,
          address,
          assetWithLocalPath,
          hp,
          undefined
        )
      } else {
        // error downloading
      }
      // loop through event que and show attacks
      queInterval = setInterval(async () => {
        if (eventQue.length) {
          const {
            victim: { asset },
            attacker: { username },
            damage,
          } = eventQue[0]

          // do canvas with attacker, hp drained and victim
          const canvas = doAttackCanvas(damage, asset, username)

          const attachment = new MessageAttachment(
            canvas.toBuffer('image/png'),
            'test-melt.png'
          )
          await interaction.reply({ files: [attachment] })
        }
      }, 3000)
    })

    // instansiate new game
    game = new Game(gamePlayers, true, false, 1000)
    // send back game embed
    const embedData: EmbedData = {
      title: 'When Owls Attack',
      description: 'Test description',
      color: 'DARK_AQUA',
      fields: Object.values(gamePlayers).map((player) => ({
        name: player.username,
        value: `HP: ${player.hp}`,
      })),
    }
    // if lose, remove loser from players and play game again
    game.embed = await interaction.reply(doEmbed(embedData))
  }

  if (commandName === 'register') {
    const address = options.getString('address')
    const assetId = options.getNumber('assetid')

    const { username, id } = user

    if (address && assetId) {
      const registrant = new User(username, id, address, { assetId }, hp)

      const { status, asset } = await processRegistration(registrant)

      const embedData: EmbedData = {
        title: 'Register',
        description: status,
        image: asset?.assetUrl,
        color: 'BLURPLE' as ColorResolvable,
      }

      await interaction.reply(doEmbed(embedData))
    }
  }

  if (commandName === 'attack') {
    const { id: attackerId } = user
    if (!game?.active)
      return interaction.reply(
        `The game hasn't started yet, please register if you haven't already and try again later`
      )

    const { id: victimId } = options.getUser('victim') as ClientUser
    const victim = game.players[victimId] ? null : game.players[victimId]
    const attacker = game.players[attackerId] ? null : game.players[attackerId]

    if (victim && attacker) {
      const damage = Math.floor(Math.random() * (hp / 2))
      victim.hp -= damage

      // if victim is dead, delete from game
      if (victim.hp <= 0) {
        delete game.players[victimId]
      }

      // if there is only one player left, the game has been won
      if (Object.values(game.players).length === 1) {
        // handle win
        game.active = false
        interaction.reply('winner')
      }
      // push event to the eventQue
      eventQue.push({
        attacker,
        victim,
        damage,
      })
      return
    }
    // either victom or attacker doesn't exist
    return interaction.reply(
      'Please register by using the /register slash command to attack'
    )
  }

  if (commandName === 'stop') {
    if (!game?.active) return interaction.reply('Game is not currently running')
    game.active = false
    return interaction.reply('game stopped')
  }

  /*
   *****************
   * TEST COMMANDS *
   *****************
   */

  // test registring and selecting players
  if (commandName === 'setup-test') {
    await asyncForEach(mockUsers, async (user: User, i: number) => {
      await processRegistration(user)
      console.log(`test user ${i + 1} added`)
    })
  }
})

client.login(token)
