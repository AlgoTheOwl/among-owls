import { collections } from '../database/database.service'
import { WithId } from 'mongodb'

export type Settings = {
  channelName: string
  hp: number
  damageRange: number
  damagePerAowl: number
  imageDir: string
  coolDownInterval: number
  minCapacity: number
  maxCapacity: number
  assetCooldown: number
  maxAssets: number
  waitingRoomRefreshRate: number
  channelId: string
  holdingsRefreshTime: number
  hootSettings: {
    hootOnWin: number
  }
}

const fallbackSettings = {
  channelName: 'testChannel1',
  hp: 420,
  damageRange: 150,
  // Score modifier
  damagePerAowl: 5,
  // File where player assets are stored
  imageDir: 'dist/nftAssets',
  // Determines how long a player has to wait before attacking again
  coolDownInterval: 5000,
  // Minimum players needed to start a game
  minCapacity: 2,
  // Max amount of players allowed to join
  maxCapacity: 4,
  // Number of minutes a user will have to wait to join a game after participating once
  assetCooldown: 30,
  // Max assets the game will capture
  maxAssets: 20,
  // How often we refersh the waiting room embed
  waitingRoomRefreshRate: 2000,
  // channel Id for config
  channelId: '',
  // number in days before bot refreshes users asset holdings
  holdingsRefreshTime: 5,
  // Settings for native asa
  hootSettings: {
    hootOnWin: 5,
  },
} as Settings

export let settings: { [key: string]: Settings } = {}

export const getSettings = async (channelId: string): Promise<Settings> => {
  if (settings[channelId]) {
    return settings[channelId]
  }

  const settingsObj = (await collections.settings.findOne({
    channelId,
  })) as WithId<Settings>

  let channelSettings

  if (!settingsObj) {
    channelSettings = fallbackSettings
  } else {
    // cache settings throughout game
    settings[channelId] = settingsObj
    channelSettings = settingsObj
  }
  return channelSettings
}

export const clearSettings = (channelId: string) => delete settings[channelId]
