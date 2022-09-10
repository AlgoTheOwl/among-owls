// Discord
import { AttachmentBuilder, TextChannel } from 'discord.js'
// Schemas
import Player from '../models/player'
import { ObjectId, WithId } from 'mongodb'
import User from '../models/user'
import embeds from '../constants/embeds'
// Data
import { collections } from '../database/database.service'
// Helpers
import { resetGame, emptyDir, asyncForEach, wait } from '../utils/helpers'
import doEmbed from '../embeds'
import { startWaitingRoom } from '.'
// Globals
import { games } from '..'
import { clearSettings, getSettings } from '../utils/settings'
import Encounter from '../models/encounter'
import Game from '../models/game'

/**
 * Update game and user state when win occurs
 * @param player last player standing
 * @param channel {TextChannel}
 */
export const handleWin = async (player: Player, channel: TextChannel) => {
  const { id: channelId } = channel
  const game = games[channelId]
  const { imageDir, hootSettings, assetCooldown } = await getSettings(channelId)
  const { hootOnWin } = hootSettings

  game.active = false
  player.win = true

  // Increment score and hoot of winning player
  const winningUser = (await collections.users.findOne({
    discordId: player.discordId,
  })) as WithId<User>

  // Render death imagery
  const attachment = new AttachmentBuilder('src/images/death.gif', {
    name: 'death.gif',
  })

  await game.megatron.edit({
    files: [attachment],
  })

  const playerArr = Object.values(game.players)

  // Save encounter
  addEncounter(game, winningUser._id, player.asset.assetId, channelId)

  // Reset state for new game
  endGameMutation(playerArr, assetCooldown, hootOnWin)
  resetGame(false, channelId)
  clearSettings(channelId)
  emptyDir(imageDir)
  // Wait a couple of seconds before rendering winning embed
  await wait(2000)
  await game.arena.edit(doEmbed(embeds.win, channelId, { player, hootOnWin }))
  // Add new waiting room
  startWaitingRoom(channel)
}

/**
 * Loop through each player and update corresponding user entry in db
 * @param players
 * @param assetCooldown
 * @param hootOnWin
 */
const endGameMutation = async (
  players: Player[],
  assetCooldown: number,
  hootOnWin: number
) => {
  await asyncForEach(players, async (player: Player) => {
    const { asset, win, kos, discordId } = player
    const assetId = asset.assetId.toString()
    const coolDownDoneDate = Date.now() + assetCooldown * 60000
    const user = (await collections.users.findOne({
      discordId,
    })) as WithId<User>

    // Provide fallbacks for null values
    const userYaoWins = user.yaoWins || 0
    const userYaoLosses = user.yaoLosses || 0
    const userYaoKos = user.yaoKos || 0

    // Increment values
    const yaoLosses = win ? user.yaoLosses : userYaoLosses + 1
    const yaoWins = win ? userYaoWins + 1 : userYaoWins
    const yaoKos = win ? userYaoKos + kos : userYaoKos
    const wins = win ? asset.wins + 1 : asset.wins
    const losses = win ? asset.losses : asset.losses + 1
    const hoot = win ? user.hoot + hootOnWin : user.hoot

    const updatedAsset = {
      ...asset,
      wins,
      losses,
      kos: asset.kos,
    }

    // Add cooldowns, update user asset
    const userData: User = {
      ...user,
      coolDowns: { ...user?.coolDowns, [assetId]: coolDownDoneDate },
      assets: {
        ...user.assets,
        [assetId]: updatedAsset,
      },
      hoot,
      yaoWins,
      yaoLosses,
      yaoKos,
    }

    await collections.users.findOneAndReplace({ discordId }, userData)
  })
}

/**
 * Adds encounter {record of game} to database
 * @param game
 * @param winnerId
 * @param winningAssetId
 * @param channelId
 */
const addEncounter = (
  game: Game,
  winnerId: ObjectId,
  winningAssetId: number,
  channelId: string
) => {
  const encounter = new Encounter(
    game.players,
    game.rounds,
    winnerId,
    winningAssetId,
    game.startTime,
    Date.now(),
    channelId
  )
  collections.encounters.insertOne(encounter)
}
