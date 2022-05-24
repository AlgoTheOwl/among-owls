import { Interaction } from 'discord.js'
import { fetchPlayers } from '../database/operations'
import User from '../models/user'
import Game from '../models/game'
import { asyncForEach, downloadFile } from '../utils/helpers'
import { EmbedData } from '../types/game'
import { Asset } from '../types/user'
import doEmbed from '../embeds'
import { mapPlayersForEmbed } from '../utils/helpers'
import { game as previousGame } from '..'

export default async function startGame(
  interaction: Interaction,
  hp: number,
  imageDir: string
) {
  if (!interaction.isCommand()) return

  if (previousGame?.active) {
    return await interaction.reply({
      content: 'A game is already running',
      ephemeral: true,
    })
  }

  const players: User[] = await fetchPlayers()

  if (!players.length) {
    return await interaction.reply({
      content: 'There are not enough players to start the game',
      ephemeral: true,
    })
  }

  await interaction.deferReply()

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
        0
      )
    } else {
      // error downloading
      await interaction.reply({
        content: 'Error downloading asset from the blockchain',
        ephemeral: true,
      })
    }
  })

  const playerArr = Object.values(gamePlayers)

  // instansiate new game
  const game = new Game(gamePlayers, true, false, 1000)
  // send back game embed
  const embedData: EmbedData = {
    fields: mapPlayersForEmbed(playerArr),
  }

  game.embed = await interaction.editReply(doEmbed(embedData))

  return game
}
