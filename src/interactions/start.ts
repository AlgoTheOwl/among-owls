import { Interaction } from 'discord.js'
import { fetchPlayers } from '../database/operations'
import User from '../models/user'
import Game from '../models/game'
import { asyncForEach, downloadFile } from '../utils/helpers'
import { EmbedData } from '../types/game'
import { Asset } from '../types/user'
import doEmbed from '../database/embeds'

export default async function startGame(
  interaction: Interaction,
  hp: number,
  imageDir: string
) {
  if (!interaction.isCommand()) return
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
      interaction.reply({
        content: 'Error downloading asset from the blockchain',
        ephemeral: true,
      })
    }
  })

  // instansiate new game
  const game = new Game(new Set(), gamePlayers, true, false, 1000)
  // send back game embed
  const embedData: EmbedData = {
    title: 'When Owls Attack',
    description: 'Who will survive?',
    color: 'DARK_AQUA',
    fields: Object.values(gamePlayers).map((player) => ({
      name: player.username,
      value: `${player.asset.unitName} - ${player.hp}`,
    })),
  }
  // if lose, remove loser from players and play game again
  game.embed = await interaction.reply(doEmbed(embedData))

  return game
}
