import { game, intervals } from '..'
import { asyncForEach, doDamage, wait } from '../utils/helpers'
import { getRandomVictimId } from './attack'
import settings from '../settings'
import Player from '../models/player'

export default async function runGame() {
  if (game.active || game.waitingRoom) {
    return
  }

  const { players } = game
  const { autoGameSettings } = settings
  const { roundIntervalLength } = autoGameSettings

  const playerArr = Object.values(players)

  intervals.autoGameInterval = setInterval(async () => {
    await asyncForEach(playerArr, async (player: Player) => {
      const { discordId } = player

      const attacker = game.players[discordId] as Player
      let victim
      if (!attacker?.timedOut && !attacker?.dead) {
        if (player.victimId) {
          victim = game.players[player.victimId]
        } else {
          victim = game.players[getRandomVictimId(discordId)]
        }
        const damage = doDamage(attacker, false)
        victim.hp -= damage
      }
    })
  }, roundIntervalLength)
}
