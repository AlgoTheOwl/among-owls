import { collections } from '../database/database.service'
import { WithId } from 'mongodb'

export type Settings = {
  channelName: string
  hp: number
  damageRange: number
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

let settings: { [key: string]: Settings } = {}

/**
 * Fetch settings for use throughout application
 * Cache fetched settings for further use
 * Provide fallback settings if needed
 * @param channelId
 * @returns {Promise<Settings>}
 */
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
