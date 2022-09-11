// Helpers
import {
  asyncForEach,
  mapPlayersForEmbed,
  randomSort,
  wait,
} from '../utils/helpers'
import { getWinningPlayer, resetGame } from '../utils/gameplay'
import { doDamage } from '../utils/attack'
import { getRandomVictimId, getAttackString } from '../utils/attack'
import { handleWin } from './win'
import doEmbed from '../embeds'
// Globals
import { games } from '..'
// Schemas
import Player from '../models/player'
import embeds from '../constants/embeds'
import { TextChannel } from 'discord.js'
import { getSettings } from '../utils/settings'

/**
 * Runs main game logic incrementally
 * Loops through each player and triggers specific or randopm attack
 * Updated embed to show attack and current player HP, update game state stats
 * @param channel {TextChannel}
 */
export default async function runGame(
  channel: TextChannel,
  playerArr: Player[]
) {
  const { id: channelId } = channel
  try {
    const game = games[channelId]
    const { damageRange } = await getSettings(channelId)

    let isWin = false

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
        if (attacker && !attacker?.dead && game.active) {
          // SELECT VICTIM
          if (player.victimId && !game.players[player.victimId].dead) {
            victim = game.players[player.victimId]
          } else {
            victim = game.players[getRandomVictimId(discordId, channelId)]
          }

          if (victim) {
            const damage = doDamage(damageRange)
            victim.hp -= damage
            if (victim.hp <= 0 && attacker) {
              victim.dead = true
              attacker.asset.kos++
              player.kos++
            }

            // HANDLE WIN
            const winningPlayer = getWinningPlayer(playerArr)
            isWin = !!winningPlayer

            if (isWin && winningPlayer && game.active) {
              handleWin(winningPlayer, channel)
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
        }
      })
    }

    game.rounds++
  } catch (error) {
    console.log('****** ERROR RUNNNINGS GAME ******', error)
    resetGame(false, channelId)
  }
}
