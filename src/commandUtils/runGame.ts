import { game } from '..'
import {
  asyncForEach,
  doDamage,
  getWinningPlayer,
  mapPlayersForEmbed,
  resetGame,
  wait,
} from '../utils/helpers'
import { handleWin } from './win'
import { getRandomVictimId, getAttackString } from '../utils/attack'
import settings from '../settings'
import Player from '../models/player'
import doEmbed from '../embeds'
import embeds from '../constants/embeds'
import { Interaction, MessageAttachment } from 'discord.js'

export default async function runGame(interaction: Interaction) {
  if (!interaction.isCommand()) return
  try {
    const { players } = game
    const { deathDeleteInterval } = settings
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
            handlingDeath = true

            const attachment = new MessageAttachment(
              'src/images/death.gif',
              'death.gif'
            )

            await interaction.editReply({
              files: [attachment],
              content: `${attacker.asset.assetName} took ${victim.username} in one fell swoop. Owls be swoopin'`,
            })

            setTimeout(async () => {
              // const file = new MessageAttachment('src/images/main.gif')
              // await interaction.editReply({ files: [file] })
              await interaction.deleteReply()
              handlingDeath = false
            }, deathDeleteInterval)
          }

          // HANDLE WIN
          const { winningPlayer, winByTimeout } = getWinningPlayer(playerArr)
          isWin = !!winningPlayer

          if (isWin && winningPlayer && game.active) {
            return handleWin(winningPlayer, winByTimeout, interaction)
          }

          // REFRESH EMBED
          const attackField = {
            name: 'ATTACK',
            value: getAttackString(
              attacker.asset.assetName,
              victim.username,
              damage
            ),
          }

          const fields = [
            ...mapPlayersForEmbed(playerArr, 'game'),
            attackField,
          ].filter(Boolean)

          await game.embed.edit(doEmbed(embeds.activeGame, { fields }))
        }
      })
    }
  } catch (error) {
    console.log(error)
    interaction.editReply(
      'something went wrong -> please resume the game again'
    )
    resetGame()
  }
}
