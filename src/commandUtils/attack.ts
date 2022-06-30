import { ButtonInteraction, MessageAttachment } from 'discord.js'
import { EmbedData } from '../types/game'
import doEmbed from '../embeds'
import {
  wait,
  mapPlayersForEmbed,
  handleWin,
  randomNumber,
  getWinningPlayer,
  getPlayerArray,
} from '../utils/helpers'
import { game } from '..'
import settings from '../settings'
import { playerTimeouts } from '..'
import { intervals } from '..'
import Player from '../models/player'
import embeds from '../constants/embeds'

const {
  timeoutInterval,
  coolDownInterval,
  hp,
  damagePerAowl,
  waitBeforeTimeoutInterval,
  kickPlayerTimeout,
  deathDeleteInterval,
} = settings

const attackStrings = [
  'HOOT, HOOT! {assetName} slashes at {victimName} for {damage} damage',
  'HI-YAH!. {assetName} karate chops at {victimName} for {damage} damage',
  'SCREEEECH!. {assetName} chucks ninja stars at {victimName} for {damage} damage',
  'HMPH!. {assetName} throws a spear at {victimName} for {damage} damage',
  'SL-SL-SL-IIICE!. {assetName} slices and dices you {victimName} for {damage} damage',
]

const errorMessages = {
  attackSelf: `Owls are supposed to be wise, but you’re clearly not. You can’t attack yourself!`,
  unRegistered:
    'Please register by using the /register slash command to attack',
  victimUnRegistered:
    'Intended victim is currently not registered, please try attacking another player',
  attackerDead: `You can't attack, you're dead!`,
  victimDead: `Your intended victim is already dead!`,
  timedOut: `Unfortunately, you've timed out due to inactivty.`,
  victimTimedOut: 'Unfortunately, this player has timed out due to inactivity',
  coolingDown: `HOO do you think you are? It's not your turn! Wait {seconds} seconds`,
  gameNotStarted: `HOO do you think you are? The game hasn’t started yet!`,
  noVictim: `Please select a victim before attacking!`,
}

export const attack = async (
  interaction: ButtonInteraction,
  random: boolean
) => {
  if (!game.active) {
    return interaction.reply({
      content: errorMessages.gameNotStarted,
      ephemeral: true,
    })
  }

  const { user } = interaction
  const { id: attackerId } = user
  const victimId = random
    ? getRandomVictimId(attackerId)
    : game?.players[user.id]?.victimId || null

  if (!victimId && !random) {
    return interaction.reply({
      content: errorMessages.noVictim,
      ephemeral: true,
    })
  }

  if (!victimId) return

  const victim = game.players[victimId] ? game.players[victimId] : null
  const attacker = game.players[attackerId] ? game.players[attackerId] : null

  const stillCoolingDown =
    attacker?.coolDownTimeLeft && attacker?.coolDownTimeLeft > 0

  const playerArr = Object.values(game.players)

  const attackRow = []

  let victimDead
  let isWin

  // Begin watching for player inactivity
  handlePlayerTimeout(attackerId, timeoutInterval)

  if (!game.attackEngaged) {
    doPlayerTimeout(attackerId)
    game.attackEngaged = true
  }

  // Handle errors
  let content
  if (victimId === attackerId) content = errorMessages.attackSelf
  if (!attacker) content = errorMessages.unRegistered
  if (!victim) content = errorMessages.victimUnRegistered
  if (attacker?.dead) content = errorMessages.attackerDead
  if (victim?.dead) content = victimDead
  if (attacker?.coolDownTimeLeft && stillCoolingDown)
    content = errorMessages.coolingDown.replace(
      '{seconds}',
      (attacker.coolDownTimeLeft / 1000).toString()
    )
  if (attacker?.timedOut) content = errorMessages.timedOut
  if (victim?.timedOut) content = errorMessages.victimTimedOut
  if (content) return interaction.reply({ content, ephemeral: true })

  if (victim && attacker) {
    handlePlayerCooldown(attackerId, coolDownInterval)
    const damage = doDamage(attacker)
    // const damage = 1000
    victim.hp -= damage
    victimDead = false

    if (victim.hp <= 0) {
      victim.dead = true
      victimDead = true
    }

    attacker.victimId = undefined

    if (victimDead && attacker) {
      const attachment = new MessageAttachment(
        'src/images/death.gif',
        'death.gif'
      )
      await interaction.reply({
        files: [attachment],
        content: `${attacker.asset.assetName} took ${victim.username} in one fell swoop. Owls be swoopin'`,
      })

      setTimeout(async () => {
        await interaction.deleteReply()
      }, deathDeleteInterval)
    } else {
      interaction.deferUpdate()
    }

    const { winningPlayer, winByTimeout } = getWinningPlayer(playerArr)

    isWin = !!winningPlayer

    if (isWin && winningPlayer && game.active) {
      return handleWin(winningPlayer, winByTimeout, game)
    }
    // push attack value into embed
    attackRow.push({
      name: 'ATTACK',
      value: getAttackString(attacker.asset.assetName, victim.username, damage),
    })
  }

  const fields = [...mapPlayersForEmbed(playerArr, 'game'), ...attackRow]

  await game.embed.edit(doEmbed(embeds.activeGame, { fields }))
}

const getAttackString = (
  assetName: string,
  victimName: string,
  damage: number
): string => {
  return attackStrings[randomNumber(0, attackStrings.length)]
    .replace('{assetName}', assetName)
    .replace('{victimName}', victimName)
    .replace('{damage}', damage.toString())
}

const handlePlayerTimeout = (playerId: string, timeoutInterval: number) => {
  const gamePlayer = game.players[playerId]

  clearTimeout(playerTimeouts[playerId])

  if (gamePlayer) {
    gamePlayer.rolledRecently = true

    const rolledRecentlyTimeout = setTimeout(async () => {
      gamePlayer.rolledRecently = false
    }, timeoutInterval)

    playerTimeouts[playerId] = rolledRecentlyTimeout
  }
}

const handlePlayerCooldown = async (
  playerId: string,
  coolDownInterval: number
): Promise<void> => {
  const gamePlayer = game.players[playerId]

  gamePlayer.coolDownTimeLeft = coolDownInterval

  while (gamePlayer.coolDownTimeLeft >= 0) {
    await wait(1000)
    gamePlayer.coolDownTimeLeft -= 1000
  }
}

const doPlayerTimeout = async (id: string): Promise<void> => {
  await wait(waitBeforeTimeoutInterval)

  intervals.timeoutInterval = setInterval(async () => {
    if (game.active) {
      let isTimeout = false
      getPlayerArray(game.players).forEach((player) => {
        if (!player.rolledRecently && !player.timedOut) {
          game.players[player.discordId].timedOut = true
          isTimeout = true
        }
      })

      const playerArr = getPlayerArray(game.players)

      const { winningPlayer, winByTimeout } = getWinningPlayer(playerArr)

      // If win
      if (winningPlayer && game.active) {
        intervals.timeoutInterval && clearInterval(intervals.timeoutInterval)
        return handleWin(winningPlayer, winByTimeout, game)
      }

      const usersTimedOut = playerArr.filter((player) => player.timedOut)

      // If everyone timed out
      if (playerArr.length === usersTimedOut.length) {
        game.embed.edit(doEmbed(embeds.timedOut))
        game.active = false
        intervals.timeoutInterval && clearInterval(intervals.timeoutInterval)
        return
      }

      // Update embed if players dropped off
      if (playerArr.length && isTimeout) {
        await game.embed.edit(doEmbed(embeds.activeGame))
      }
    }
  }, kickPlayerTimeout)
}

const doDamage = (player: Player): number => {
  const { assetMultiplier } = player
  const multiplierDamage =
    (assetMultiplier >= 20 ? 20 : assetMultiplier) * damagePerAowl
  return Math.floor(Math.random() * (hp / 10)) + multiplierDamage
}

const getRandomVictimId = (attackerId: string): string => {
  const filteredPlayerArray = Object.values(game.players).filter(
    (player) =>
      player?.discordId !== attackerId && !player.timedOut && !player.dead
  )
  const randomIndex = Math.floor(Math.random() * filteredPlayerArray.length)
  return filteredPlayerArray[randomIndex]?.discordId as string
}
