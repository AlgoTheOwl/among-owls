"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
let settings = {};
const env = process.env.ENV;
if (env === 'DEV') {
    settings = {
        '984079278683598928': {
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
            channelId: '984079278683598928',
            // Settings for native asa
            hootSettings: {
                hootOnWin: 5,
            },
        },
        '1008125272110923776': {
            channelName: 'testChannel2',
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
            channelId: '984079278683598928',
            // Settings for native asa
            hootSettings: {
                hootOnWin: 5,
            },
        },
    };
}
if (env === 'PROD') {
    settings = {
        '1003046615273189496': {
            channelName: 'among-4-aowls',
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
            channelId: '984079278683598928',
            // Settings for native asa
            hootSettings: {
                hootOnWin: 5,
            },
        },
        '1009316590237528064': {
            channelName: 'aowl-vs-aowl',
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
            maxCapacity: 2,
            // Number of minutes a user will have to wait to join a game after participating once
            assetCooldown: 30,
            // Max assets the game will capture
            maxAssets: 20,
            // How often we refersh the waiting room embed
            waitingRoomRefreshRate: 2000,
            // channel Id for config
            channelId: '984079278683598928',
            // Settings for native asa
            hootSettings: {
                hootOnWin: 2,
            },
        },
    };
}
exports.default = settings;
