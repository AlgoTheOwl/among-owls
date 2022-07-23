type Settings = {
  hp: number
  damageRange: number
  damagePerAowl: number
  imageDir: string
  kickPlayerTimeout: number
  coolDownInterval: number
  messageDeleteInterval: number
  deathDeleteInterval: number
  timeoutInterval: number
  waitBeforeTimeoutInterval: number
  minCapacity: number
  maxCapacity: number
  assetCooldown: number
  maxAssets: number
  waitingRoomRefreshRate: number
  hootSettings: {
    hootOnWin: number
  }
  channelId: string
}

export default {
  hp: 420,
  damageRange: 150,
  // Score modifier
  damagePerAowl: 5,
  // File where player assets are stored
  imageDir: 'dist/nftAssets',
  // Determines how often game checks for players timed out
  kickPlayerTimeout: 5000,
  // Determines how long a player has to wait before attacking again
  coolDownInterval: 5000,
  // Determines how quickly normal messages are deleted
  messageDeleteInterval: 2000,
  // Determines how quickly death gifs are deleted
  deathDeleteInterval: 5000,
  // Determines how long a player has to be inactive before timing out
  timeoutInterval: 30000,
  // Wait this long before kicking timeed out players after the game starts
  waitBeforeTimeoutInterval: 5000,
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
  // Settings for native asa
  hootSettings: {
    hootOnWin: 5,
  },
  channelId: '984079278683598928',
} as Settings
