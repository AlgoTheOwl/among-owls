"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clearSettings = exports.getSettings = void 0;
const database_service_1 = require("../database/database.service");
const fallbackSettings = {
    channelName: 'testChannel1',
    hp: 420,
    damageRange: 150,
    // Score modifier
    damagePerAowl: 5,
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
};
let settings = {};
/**
 * Fetch settings for use throughout application
 * Cache fetched settings for further use
 * Provide fallback settings if needed
 * @param channelId
 * @returns
 */
const getSettings = async (channelId) => {
    if (settings[channelId]) {
        return settings[channelId];
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
        settings[channelId] = settingsObj;
        channelSettings = settingsObj;
    }
    return channelSettings;
};
exports.getSettings = getSettings;
const clearSettings = (channelId) => delete settings[channelId];
exports.clearSettings = clearSettings;
