import Player from '../models/player'
import Game from '../models/game'
import { intervals } from '..'
import { collections } from '../database/database.service'
import { WithId } from 'mongodb'
import User from '../models/user'
import { resetGame, emptyDir, asyncForEach } from '../utils/helpers'
import settings from '../settings'
import doEmbed from '../embeds'
import embeds from '../constants/embeds'

export const handleWin = async (
  player: Player,
  winByTimeout: boolean,
  game: Game
) => {
  const { imageDir, hootSettings } = settings
  const { hootOnWin } = hootSettings
  // handle win
  game.active = false
  intervals.timeoutInterval && clearInterval(intervals.timeoutInterval)

  // Increment score and hoot of winning player
  const winningUser = (await collections.users.findOne({
    _id: player.userId,
  })) as WithId<User>

  const currentHoot = winningUser.hoot ? winningUser.hoot : 0
  const updatedScore = winningUser.yaoWins ? winningUser.yaoWins + 1 : 1
  const updatedHoot = currentHoot + hootOnWin

  console.log('updated hoot', updatedHoot)

  await collections.users.findOneAndUpdate(
    { _id: player.userId },
    { $set: { yaoWins: updatedScore, hoot: updatedHoot } }
  )

  const playerArr = Object.values(game.players)

  resetGame()
  emptyDir(imageDir)
  setAssetTimeout(playerArr)
  return game.embed.edit(doEmbed(embeds.win, { winByTimeout, player }))
}

const setAssetTimeout = async (players: Player[]) => {
  // For each player set Asset timeout on user
  await asyncForEach(players, async (player: Player) => {
    const { userId, asset } = player
    const { assetId } = asset
    const { assetCooldown } = settings
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
