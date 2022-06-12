import { MessageAttachment, SelectMenuInteraction } from 'discord.js'
import { EmbedData, Field } from '../types/game'
import doEmbed from '../embeds'
import { SlashCommandBuilder } from '@discordjs/builders'
// import doAttackCanvas from '../canvas/attackCanvas'
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

const {
  timeoutInterval,
  coolDownInterval,
  hp,
  waitBeforeTimeoutInterval,
  kickPlayerTimeout,
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
}

const getAttackString = (
  assetName: string,
  victimName: string,
  damage: number
) => {
  return attackStrings[randomNumber(0, attackStrings.length)]
    .replace('{assetName}', assetName)
    .replace('{victimName}', victimName)
    .replace('{damage}', damage.toString())
}

const handlePlayerTimeout = (playerId: string, timeoutInterval: number) => {
  const gamePlayer = game.players[playerId]

  clearTimeout(playerTimeouts[playerId])

  gamePlayer.rolledRecently = true

  const rolledRecentlyTimeout = setTimeout(async () => {
    gamePlayer.rolledRecently = false
  }, timeoutInterval)

  playerTimeouts[playerId] = rolledRecentlyTimeout
}

const handlePlayerCooldown = async (
  playerId: string,
  coolDownInterval: number
) => {
  const gamePlayer = game.players[playerId]

  gamePlayer.coolDownTimeLeft = coolDownInterval

  while (gamePlayer.coolDownTimeLeft >= 0) {
    await wait(1000)
    gamePlayer.coolDownTimeLeft -= 1000
  }
}

const doPlayerTimeout = async (id: string) => {
  await wait(waitBeforeTimeoutInterval)

  intervals.timeoutInterval = setInterval(async () => {
    if (game.active) {
      console.log('running timeout')
      let isTimeout = false
      getPlayerArray(game.players).forEach((player) => {
        if (!player.rolledRecently) {
          game.players[player.discordId].timedOut = true
          isTimeout = true
          console.log('user is timed out')
        }
      })

      const playerArr = getPlayerArray(game.players)

      const { winningPlayer, winByTimeout } = getWinningPlayer(playerArr)

      // If win
      if (winningPlayer && game.active) {
        console.log('is win')
        intervals.timeoutInterval && clearInterval(intervals.timeoutInterval)
        return handleWin(winningPlayer, winByTimeout, game)
      }

      const usersTimedOut = playerArr.filter((player) => player.timedOut)

      // If everyone timed out
      if (playerArr.length === usersTimedOut.length) {
        const embedData: EmbedData = {
          image: undefined,
          title: 'BOOOO!!!',
          description:
            'Game has ended due to all players being removed for inactivity',
        }

        game.embed.edit(doEmbed(embedData))
        game.active = false
        intervals.timeoutInterval && clearInterval(intervals.timeoutInterval)
        return
      }

      if (playerArr.length && isTimeout) {
        console.log('updating leaderboard isTimeout')
        const embedData: EmbedData = {
          fields: mapPlayersForEmbed(getPlayerArray(game.players)),
          image: undefined,
        }
        return game.embed.edit(doEmbed(embedData))
      }
    }
  }, kickPlayerTimeout)
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('attack')
    .setDescription('Attack another user!'),
  async execute(interaction: SelectMenuInteraction) {
    if (!interaction.isSelectMenu()) return
    if (!game.active) {
      return interaction.reply({
        content: `HOO do you think you are? The game hasn’t started yet!`,
        ephemeral: true,
      })
    }

    interaction.deferUpdate()

    const { user } = interaction
    const { values: idArr } = interaction
    const victimId = idArr[0]
    const { id: attackerId } = user

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

    if (content) {
      interaction.followUp({ content, ephemeral: true })
    } else if (victim && attacker) {
      handlePlayerCooldown(attackerId, coolDownInterval)

      const damage = Math.floor(Math.random() * (hp / 2))
      // const damage = 1000
      victim.hp -= damage

      victimDead = false
      if (victim.hp <= 0) {
        // if victim is dead, delete from game
        game.players[victimId].dead = true
        victimDead = true
      }

      if (victimDead && attacker) {
        const attachment = new MessageAttachment(
          'src/images/death.gif',
          'death.gif'
        )
        await interaction.editReply({
          files: [attachment],
          content: `${attacker.asset.assetName} took ${victim.username} in one fell swoop. Owls be swoopin'`,
        })
      } else {
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

    const fields = [...mapPlayersForEmbed(playerArr), ...attackRow]

    const embedData: EmbedData = {
      color: 'RED',
      fields,
      image: undefined,
      isMain: true,
    }

    await game.embed.edit(doEmbed(embedData))
  },
}
