"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clearSettings = exports.getSettings = exports.settings = void 0;
const database_service_1 = require("../database/database.service");
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
    // Settings for native asa
    hootSettings: {
        hootOnWin: 5,
    },
};
exports.settings = {};
const getSettings = async (channelId) => {
    if (exports.settings[channelId]) {
        return exports.settings[channelId];
    }
    const settingsObj = (await database_service_1.collections.settings.findOne({
        channelId,
    }));
    let channelSettings;
    if (!settingsObj) {
        channelSettings = fallbackSettings;
    }
    else {
        // cache settings throughout game
        exports.settings[channelId] = settingsObj;
        channelSettings = settingsObj;
    }
    return channelSettings;
};
exports.getSettings = getSettings;
const clearSettings = (channelId) => delete exports.settings[channelId];
exports.clearSettings = clearSettings;
