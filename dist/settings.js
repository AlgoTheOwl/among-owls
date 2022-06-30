"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = {
    hp: 1000,
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
    deathDeleteInterval: 8000,
    // Determines how long a player has to be inactive before timing out
    timeoutInterval: 30000,
    // Wait this long before kicking timeed out players after the game starts
    waitBeforeTimeoutInterval: 5000,
    // Max amount of players allowed to join
    maxCapacity: 20,
    // Number of minutes a user will have to wait to join a game after participating once
    userCooldown: 30,
    // Max assets the game will capture
    maxAssets: 20,
};
