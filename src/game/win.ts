// Discord
import { AttachmentBuilder } from 'discord.js'
// Schemas
import Player from '../models/player'
import { WithId } from 'mongodb'
import User from '../models/user'
import embeds from '../constants/embeds'
// Data
import { collections } from '../database/database.service'
// Helpers
import { resetGame, emptyDir, asyncForEach, wait } from '../utils/helpers'
import doEmbed from '../embeds'
import { startWaitingRoom } from '.'
// Globals
import { game } from '..'
import settings from '../settings'

export const handleWin = async (
  player: Player,
  winByTimeout: boolean,
  channelId: string
) => {
  const { imageDir, hootSettings, assetCooldown } = settings[channelId]
  const { hootOnWin } = hootSettings
  game.active = false

  // Increment score and hoot of winning player
  const winningUser = (await collections.users.findOne({
    _id: player.userId,
  })) as WithId<User>

  const attachment = new AttachmentBuilder('src/images/death.gif', {
    name: 'death.gif',
  })
  await game.megatron.edit({
    files: [attachment],
  })

  // Update user stats
  const currentHoot = winningUser.hoot ? winningUser.hoot : 0
  const updatedHoot = currentHoot + hootOnWin
  const updatedScore = winningUser.yaoWins ? winningUser.yaoWins + 1 : 1
  const updatedAssets = updateAsset(winningUser)

  await collections.users.findOneAndUpdate(
    { _id: player.userId },
    {
      $set: { yaoWins: updatedScore, hoot: updatedHoot, assets: updatedAssets },
    }
  )

  const playerArr = Object.values(game.players)

  resetGame()
  emptyDir(imageDir)
  setAssetTimeout(playerArr, assetCooldown)
  await wait(2000)
  await game.arena.edit(doEmbed(embeds.win, { winByTimeout, player }))
  // Add new waiting room
  startWaitingRoom(channelId)
}

const setAssetTimeout = async (players: Player[], assetCooldown: number) => {
  // For each player set Asset timeout on user
  await asyncForEach(players, async (player: Player) => {
    const { userId, asset } = player
    const { assetId } = asset
    const coolDownDoneDate = Date.now() + assetCooldown * 60000
    const user = await collections.users.findOne({ _id: userId })
    await collections.users.findOneAndUpdate(
      { _id: userId },
      {
        $set: {
          coolDowns: { ...user?.coolDowns, [assetId]: coolDownDoneDate },
        },
      }
    )
  })
}

const updateAsset = (winningUser: User) => {
  const winnerAssets = winningUser.assets
  const winningAsset = game.players[winningUser.discordId].asset
  const winningAssetWins = winningAsset.wins ? winningAsset.wins + 1 : 1
  const updatedAsset = { ...winningAsset, wins: winningAssetWins }
  return { ...winnerAssets, [updatedAsset.assetId]: updatedAsset }
}
