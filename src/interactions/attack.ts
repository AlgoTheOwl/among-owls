import {
  MessageAttachment,
  SelectMenuInteraction,
  User as DiscordUser,
} from 'discord.js'
import Game from '../models/game'
import { EmbedData } from '../types/game'
import doEmbed from '../embeds'
// import doAttackCanvas from '../canvas/attackCanvas'
import {
  wait,
  mapPlayersForEmbed,
  handleWin,
  randomNumber,
  getWinningPlayer,
} from '../utils/helpers'
import { game } from '..'
import settings from '../settings'

const {
  timeoutInterval,
  coolDownInterval,
  messageDeleteInterval,
  deathDeleteInterval,
} = settings

export default async function attack(
  interaction: SelectMenuInteraction,
  game: Game,
  user: DiscordUser,
  hp: number
) {
  if (!game.active) return

  const { values: idArr } = interaction

  const victimId = idArr[0]
  const { id: attackerId } = user

  const victim = game.players[victimId] ? game.players[victimId] : null
  const attacker = game.players[attackerId] ? game.players[attackerId] : null

  const stillCoolingDown =
    attacker?.coolDownTimeLeft && attacker?.coolDownTimeLeft > 0

  const canAttack =
    attacker &&
    victim &&
    !stillCoolingDown &&
    !victim.timedOut &&
    !attacker.timedOut &&
    victimId !== attackerId

  const playerArr = Object.values(game.players)

  let victimDead
  let isWin

  // Begin watching for player inactivity
  handlePlayerTimeout(attackerId, timeoutInterval)

  let replied

  if (victimId === attackerId) {
    interaction.reply({
      content: `Owls are supposed to be wise, but you’re clearly not. You can’t attack yourself!`,
      ephemeral: true,
    })
    replied = true
  }

  if (!attacker && !replied) {
    interaction.reply({
      content: 'Please register by using the /register slash command to attack',
      ephemeral: true,
    })
    replied = true
  }

  if (!victim && !replied) {
    interaction.reply({
      content:
        'Intended victim is currently not registered, please try attacking another player',
      ephemeral: true,
    })
    replied = true
  }

  if (attacker?.dead && !replied) {
    interaction.reply({
      content: `You can't attack, you're dead!`,
      ephemeral: true,
    })
    replied = true
  }

  if (victim?.dead && !replied) {
    interaction.reply({
      content: `Your intended victim is already dead!`,
      ephemeral: true,
    })
    replied = true
  }

  if (attacker?.coolDownTimeLeft && stillCoolingDown && !replied) {
    interaction.reply({
      content: `HOO do you think you are? It’s not your turn! Wait ${
        attacker.coolDownTimeLeft / 1000
      } seconds`,
      ephemeral: true,
    })
    replied = true
  }

  if (attacker?.timedOut && !replied) {
    interaction.reply({
      content: `Unfortunately, you've timed out due to inactivty.`,
      ephemeral: true,
    })
    replied = true
  }

  if (victim?.timedOut && !replied) {
    interaction.reply({
      content: 'Unfortunately, this player has timed out due to inactivity',
      ephemeral: true,
    })
    replied = true
  }

  if (canAttack) {
    // Only start cooldown if attack actually happens
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
    const { username: victimName } = victim
    const { asset: attackerAsset } = attacker

    if (victimDead) {
      const attachment = new MessageAttachment(
        'src/images/death.gif',
        'death.gif'
      )
      await interaction.reply({
        files: [attachment],
        content: `${attacker.asset.assetName} took ${victim.username} in one fell swoop. Owls be swoopin'`,
      })
    } else {
      interaction.reply(
        getAttackString(attackerAsset.assetName, victimName, damage)
      )
    }

    const { winningPlayer, winByTimeout } = getWinningPlayer(playerArr)

    isWin = !!winningPlayer

    console.log('is Win', isWin)
    console.log('winning player', winningPlayer)

    if (isWin && winningPlayer && game.active) {
      handleWin(winningPlayer, winByTimeout)
    }
  }

  const embedData: EmbedData = {
    color: 'RED',
    fields: mapPlayersForEmbed(playerArr),
    image: undefined,
    isMain: true,
  }

  await game.embed.edit(doEmbed(embedData))
  await wait(victimDead || isWin ? deathDeleteInterval : messageDeleteInterval)
  await interaction.deleteReply()
}

/*
 *****************
 **** HELPERS ****
 *****************
 */

const attackStrings = [
  'HOOT, HOOT! {assetName} slashes at {victimName} for {damage} damage',
  'HI-YAH!. {assetName} karate chops at {victimName} for {damage} damage',
  'SCREEEECH!. {assetName} chucks ninja stars at {victimName} for {damage} damage',
  'HMPH!. {assetName} throws a spear at {victimName} for {damage} damage',
  'SL-SL-SL-IIICE!. {assetName} slices and dices you {victimName} for {damage} damage',
]

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

const playerTimeouts: { [key: string]: ReturnType<typeof setTimeout> } = {}

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
