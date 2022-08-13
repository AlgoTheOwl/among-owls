// Helpers
import {
  asyncForEach,
  doDamage,
  getWinningPlayer,
  mapPlayersForEmbed,
  resetGame,
  wait,
} from '../utils/helpers'
import { getRandomVictimId, getAttackString } from '../utils/attack'
import { handleWin } from './win'
import doEmbed from '../embeds'
// Globals
import { games } from '..'
// Schemas
import Player from '../models/player'
import embeds from '../constants/embeds'
import settings from '../settings'
import { TextChannel } from 'discord.js'

export default async function runGame(channel: TextChannel) {
  const { id: channelId } = channel
  try {
    const game = games[channelId]
    const playerArr = Object.values(game.players)
    const { damagePerAowl, damageRange } = settings[channelId]

    let isWin = false
    let handlingDeath = false

    // MAIN GAME LOOP
    while (
      !game.stopped &&
      !game.waitingRoom &&
      game.active &&
      playerArr.length > 1
    ) {
      await asyncForEach(playerArr, async (player: Player) => {
        if (!player.dead) {
          await wait(2000)
        }
        const { discordId } = player
        const attacker = game.players[discordId] as Player
        let victim

        // DO DAMAGE
        if (attacker && !attacker?.timedOut && !attacker?.dead && game.active) {
          if (player.victimId && !game.players[player.victimId].dead) {
            victim = game.players[player.victimId]
          } else {
            victim = game.players[getRandomVictimId(discordId, channelId)]
          }
          const damage = doDamage(attacker, false, damagePerAowl, damageRange)

          if (victim) {
            victim.hp -= damage
          }

          // HANDLE DEATH
          if (victim.hp <= 0 && attacker && !handlingDeath) {
            victim.dead = true
          }

          // HANDLE WIN
          const { winningPlayer, winByTimeout } = getWinningPlayer(playerArr)
          isWin = !!winningPlayer

          if (isWin && winningPlayer && game.active) {
            handleWin(winningPlayer, winByTimeout, channel)
          }

          // REFRESH EMBED
          const attackField = {
            name: 'ATTACK',
            value: getAttackString(
              attacker.asset.alias || attacker.asset.assetName,
              victim.username,
              damage
            ),
          }

          const fields = [
            ...mapPlayersForEmbed(playerArr, 'game'),
            attackField,
          ].filter(Boolean)

          await game.arena.edit(
            doEmbed(embeds.activeGame, channelId, { fields })
          )
          if (isWin) {
            return
          }
        }
      })
    }
  } catch (error) {
    console.log(error)
    resetGame(false, channelId)
  }
}
