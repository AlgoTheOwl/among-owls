import Player from '../models/player'
import { games } from '..'
import doEmbed from '../embeds'
import { collections } from '../database/database.service'
import User from '../models/user'
import embeds from '../constants/embeds'
import { asyncForEach } from './helpers'
import Game from '../models/game'
import { WithId } from 'mongodb'

/**
 * Fetches winning player or returns undefined
 * @param playerArr
 * @returns {Player | undefined}
 */
export const getWinningPlayer = (playerArr: Player[]): Player | undefined => {
  const activePlayers = playerArr.filter((player) => !player.dead)
  return activePlayers.length === 1 ? activePlayers[0] : undefined
}

/**
 * Resets game state for a specified channel
 * Sends "stopped" embed if game is actively stopped
 * @param stopped
 * @param channelId
 */
export const resetGame = (
  stopped: boolean = false,
  channelId: string
): void => {
  const game = games[channelId]
  game.players = {}
  game.active = false
  game.win = false
  game.waitingRoom = false
  game.attackEngaged = false
  game.stopped = false
  game.megatron = undefined

  if (stopped) {
    game.stopped = true
    stopped && game?.embed?.edit(doEmbed(embeds.stopped, channelId))
  }
}

/**
 * Returns a user db entry for every registered player
 * @param players
 * @returns {Promise<User[]>}
 */
export const getUsersFromPlayers = async (
  players: Player[]
): Promise<User[]> => {
  const users: User[] = []
  await asyncForEach(players, async (player: Player) => {
    const user = (await collections.users.findOne({
      discordId: player.discordId,
    })) as WithId<User>
    users.push(user)
  })
  return users
}

/**
 * Toggles the update flag in the game state on for 3 seconds
 * Loop watching game will "notice" this and update
 * @param channelId
 */
export const updateGame = (channelId: string): void => {
  const game = games[channelId]
  game.update = true
  setTimeout(() => {
    game.update = false
  }, 3000)
}

/**
 * Checks all games to see if specific asset is registered in one
 * Used to limit players from entering multiple games
 * @param games
 * @param assetId
 * @param discordId
 * @returns {Boolean}
 */
export const checkIfRegisteredPlayer = (
  games: { [key: string]: Game },
  assetId: string,
  discordId: string
): boolean => {
  let gameCount = 0
  const gameArray = Object.values(games)
  gameArray.forEach((game: Game) => {
    if (game.players[discordId]?.asset?.assetId === Number(assetId)) gameCount++
  })
  return gameCount >= 1
}
