"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRandomVictimId = exports.getAttackString = void 0;
const helpers_1 = require("../utils/helpers");
const __1 = require("..");
const attackStrings = [
    'HOOT, HOOT! {assetName} slashes at\n {victimName} for {damage} damage',
    'HI-YAH!. {assetName} karate chops at\n {victimName} for {damage} damage',
    'SCREEEECH!. {assetName} chucks ninja\n stars at {victimName} for {damage} damage',
    'HMPH!. {assetName} throws a spear at\n {victimName} for {damage} damage',
    'SL-SL-SL-IIICE!. {assetName} slices and\n dices you {victimName} for {damage} damage',
];
const getAttackString = (assetName, victimName, damage) => {
    return attackStrings[(0, helpers_1.randomNumber)(0, attackStrings.length)]
        .replace('{assetName}', assetName)
        .replace('{victimName}', victimName)
        .replace('{damage}', damage.toString());
};
exports.getAttackString = getAttackString;
const getRandomVictimId = (attackerId) => {
    var _a;
    const filteredPlayerArray = Object.values(__1.game.players).filter((player) => (player === null || player === void 0 ? void 0 : player.discordId) !== attackerId && !player.timedOut && !player.dead);
    const randomIndex = Math.floor(Math.random() * filteredPlayerArray.length);
    return (_a = filteredPlayerArray[randomIndex]) === null || _a === void 0 ? void 0 : _a.discordId;
};
exports.getRandomVictimId = getRandomVictimId;
