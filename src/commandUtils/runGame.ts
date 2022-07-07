import { game, intervals } from '..'
import {
  asyncForEach,
  doDamage,
  getWinningPlayer,
  mapPlayersForEmbed,
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
  if (game.active || game.waitingRoom) {
    return interaction.reply({
      content: 'Game is already active',
      ephemeral: true,
    })
  }

  await interaction.deferReply()

  const { players } = game
  const { autoGameSettings, deathDeleteInterval } = settings
  const { roundIntervalLength } = autoGameSettings
  const playerArr = Object.values(players)

  let victimDead: boolean | null
  let isWin: boolean | null
  const attackRow: Field[] = []

  intervals.autoGameInterval = setInterval(async () => {
    await asyncForEach(playerArr, async (player: Player) => {
      const { discordId } = player
      const attacker = game.players[discordId] as Player
      let victim

      // DO DAMAGE
      if (attacker && !attacker?.timedOut && !attacker?.dead) {
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
        if (victimDead && attacker) {
          const attachment = new MessageAttachment(
            'src/images/death.gif',
            'death.gif'
          )
          await interaction.editReply({
            files: [attachment],
            content: `${attacker.asset.assetName} took ${victim.username} in one fell swoop. Owls be swoopin'`,
          })

          setTimeout(async () => {
            await interaction.deleteReply()
          }, deathDeleteInterval)
        }

        const { winningPlayer, winByTimeout } = getWinningPlayer(playerArr)
        isWin = !!winningPlayer

        if (isWin && winningPlayer && game.active) {
          return handleWin(winningPlayer, winByTimeout, game)
        }
        // push attack value into embed
        attackRow.push({
          name: 'ATTACK',
          value: getAttackString(
            attacker.asset.assetName,
            victim.username,
            damage
          ),
        })
      }

      // RESPOND WITH EMEBED
      const fields = [
        ...mapPlayersForEmbed(playerArr, 'game'),
        ...attackRow,
      ].filter(Boolean)

      await game.embed.edit(doEmbed(embeds.activeGame, { fields }))
    })
  }, roundIntervalLength)
}
