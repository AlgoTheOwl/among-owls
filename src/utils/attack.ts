import { randomNumber } from '../utils/helpers'
import { games } from '..'

const attackStrings = [
  'HOOT, HOOT! {assetName} slashes at\n {victimName} for {damage} damage',
  'HI-YAH!. {assetName} karate chops at\n {victimName} for {damage} damage',
  'SCREEEECH!. {assetName} chucks ninja\n stars at {victimName} for {damage} damage',
  'HMPH!. {assetName} throws a spear at\n {victimName} for {damage} damage',
  'SL-SL-SL-IIICE!. {assetName} slices and\n dices you {victimName} for {damage} damage',
]

export const getAttackString = (
  assetName: string,
  victimName: string,
  damage: number
): string => {
  return attackStrings[randomNumber(0, attackStrings.length)]
    .replace('{assetName}', assetName)
    .replace('{victimName}', victimName)
    .replace('{damage}', damage.toString())
}

export const getRandomVictimId = (
  attackerId: string,
  channelId: string
): string => {
  const game = games[channelId]
  const filteredPlayerArray = Object.values(game.players).filter(
    (player) => player?.discordId !== attackerId && !player.dead
  )
  const randomIndex = Math.floor(Math.random() * filteredPlayerArray.length)
  return filteredPlayerArray[randomIndex]?.discordId as string
}
