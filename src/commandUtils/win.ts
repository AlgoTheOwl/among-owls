import Player from '../models/player'
import Game from '../models/game'
import { intervals } from '..'
import { collections } from '../database/database.service'
import { WithId } from 'mongodb'
import User from '../models/user'
import { resetGame, emptyDir } from '../utils/helpers'
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

  // Increment score of winning player
  const winningUser = (await collections.users.findOne({
    _id: player.userId,
  })) as WithId<User>

  const updatedScore = winningUser.yaoWins ? winningUser.yaoWins + 1 : 1
  const updatedHoot = (winningUser.hoot += hootOnWin)

  await collections.users.findOneAndUpdate(
    { _id: player.userId },
    { $set: { yaoWins: updatedScore, hoot: updatedHoot } }
  )

  resetGame()
  emptyDir(imageDir)
  return game.embed.edit(doEmbed(embeds.win, { winByTimeout, player }))
}
