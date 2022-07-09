import { game, intervals } from '..'
import {
  asyncForEach,
  doDamage,
  getWinningPlayer,
  mapPlayersForEmbed,
  wait,
} from '../utils/helpers'
import { handleWin } from './win'
import { getRandomVictimId, getAttackString } from './attack'
import settings from '../settings'
import Player from '../models/player'
import doEmbed from '../embeds'
import embeds from '../constants/embeds'
import { Interaction, MessageAttachment } from 'discord.js'
import { Field } from '../types/game'

export default async function runGame(interaction: Interaction) {
  if (!interaction.isCommand()) return

  const { players } = game
  const { autoGameSettings, deathDeleteInterval } = settings
  const { roundIntervalLength } = autoGameSettings
  const playerArr = Object.values(players)

  let isWin = false
  let attackField: Field | null
  let handlingDeath = false

  while (
    !game.stopped &&
    !game.waitingRoom &&
    game.active &&
    playerArr.length > 1
  ) {
    await asyncForEach(playerArr, async (player: Player) => {
      const { discordId } = player
      const attacker = game.players[discordId] as Player
      let victim
      let victimDead = false

      // DO DAMAGE
      if (attacker && !attacker?.timedOut && !attacker?.dead && game.active) {
        if (player.victimId) {
          victim = game.players[player.victimId]
        } else {
          victim = game.players[getRandomVictimId(discordId)]
        }
        const damage = doDamage(attacker, false)
        victim.hp -= damage

        if (victim.hp <= 0) {
          victim.dead = true
          victimDead = true
        }

        // HANDLE DEATH
        if (victimDead && attacker && !handlingDeath) {
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
            const file = new MessageAttachment('src/images/main.gif')
            await interaction.editReply({ files: [file] })
          }, deathDeleteInterval)
        }

        const { winningPlayer, winByTimeout } = getWinningPlayer(playerArr)
        isWin = !!winningPlayer

        if (isWin && winningPlayer && game.active) {
          return handleWin(winningPlayer, winByTimeout, game)
        }
        // push attack value into embed
        attackField = {
          name: 'ATTACK',
          value: getAttackString(
            attacker.asset.assetName,
            victim.username,
            damage
          ),
        }
        // RESPOND WITH EMEBED
        const fields = [
          ...mapPlayersForEmbed(playerArr, 'game'),
          attackField,
        ].filter(Boolean)

        game.embed.edit(doEmbed(embeds.activeGame, { fields }))
        await wait(2000)
      }
    })
  }
}
