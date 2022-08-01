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
import { game } from '..'
// Schemas
import Player from '../models/player'
import embeds from '../constants/embeds'

export default async function runGame() {
  try {
    const { players } = game
    const playerArr = Object.values(players)

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
        await wait(2000)
        const { discordId } = player
        const attacker = game.players[discordId] as Player
        let victim

        // DO DAMAGE
        if (attacker && !attacker?.timedOut && !attacker?.dead && game.active) {
          if (player.victimId) {
            victim = game.players[player.victimId]
          } else {
            victim = game.players[getRandomVictimId(discordId)]
          }
          const damage = doDamage(attacker, false)
          victim.hp -= damage

          // HANDLE DEATH
          if (victim.hp <= 0 && attacker && !handlingDeath) {
            victim.dead = true
            // handlingDeath = true

            // const attachment = new MessageAttachment(
            //   'src/images/death.gif',
            //   'death.gif'
            // )

            // await game.megatron.edit({
            //   files: [attachment],
            //   content: `${attacker.asset.assetName} took ${victim.username} in one fell swoop. Owls be swoopin'`,
            // })

            // setTimeout(async () => {
            //   const file = new MessageAttachment('src/images/main.gif')
            //   await game.megatron.edit({ files: [file] })
            //   handlingDeath = false
            // }, deathDeleteInterval)
          }

          // HANDLE WIN
          const { winningPlayer, winByTimeout } = getWinningPlayer(playerArr)
          isWin = !!winningPlayer

          if (isWin && winningPlayer && game.active) {
            return handleWin(winningPlayer, winByTimeout)
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

          await game.arena.edit(doEmbed(embeds.activeGame, { fields }))
        }
      })
    }
  } catch (error) {
    console.log(error)
    resetGame()
  }
}
