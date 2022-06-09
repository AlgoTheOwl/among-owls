import { Interaction, MessageAttachment } from 'discord.js'
import Game from '../models/game'
import { asyncForEach, downloadFile, emptyDir } from '../utils/helpers'
import { EmbedData } from '../types/game'
import Asset from '../models/asset'
import doEmbed from '../embeds'
import { mapPlayersForEmbed } from '../utils/helpers'
import { game as previousGame } from '..'
import Player from '../models/player'
import { collections } from '../database/database.service'
import { WithId } from 'mongodb'

export default async function startGame(
  interaction: Interaction,
  hp: number,
  imageDir: string
) {
  try {
    if (!interaction.isCommand()) return

    if (previousGame?.active) {
      return await interaction.reply({
        content: 'A game is already running',
        ephemeral: true,
      })
    }

    const players = (await collections.yaoPlayers
      .find({})
      .toArray()) as WithId<Player>[]

    if (players.length < 2) {
      return await interaction.reply({
        content: 'There are not enough players to start the game',
        ephemeral: true,
      })
    }

    await interaction.deferReply()

    const gamePlayers: { [key: string]: Player } = {}

    // empty image directory
    emptyDir(imageDir)

    await asyncForEach(players, async (player: Player) => {
      const { username, discordId, address, asset, userId } = player

      // save each image locally for use later
      const localPath = await downloadFile(asset, imageDir, username)

      if (localPath) {
        const assetWithLocalPath: Asset = { ...asset, localPath }

        gamePlayers[discordId] = new Player(
          username,
          discordId,
          address,
          assetWithLocalPath,
          userId,
          hp,
          0
        )
      } else {
        // error downloading
        await interaction.reply({
          content:
            'Error downloading assets from the blockchain, please try again',
          ephemeral: true,
        })
      }
    })

    const playerArr = Object.values(gamePlayers)

    // instansiate new game
    const game = new Game(gamePlayers, true, false, 1000)

    // send back game embed
    const embedData: EmbedData = {
      image: undefined,
      fields: mapPlayersForEmbed(playerArr),
      description: 'Leaderboard',
    }

    const file = new MessageAttachment('src/images/main.gif')

    // send embed here
    await interaction.editReply({ files: [file] })

    game.embed = await interaction.followUp(doEmbed(embedData))

    return game
  } catch (error) {
    //@ts-ignore
    interaction.reply({
      content:
        'Error starting game - sometimes requests time out here - try starting the game again',
      ephemeral: true,
    })
  }
}
