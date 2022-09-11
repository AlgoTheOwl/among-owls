"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.doDamage = exports.getRandomVictimId = exports.getAttackString = void 0;
const helpers_1 = require("../utils/helpers");
const __1 = require("..");
const attackStrings = [
    'HOOT, HOOT! {assetName} slashes at\n {victimName} for {damage} damage',
    'HI-YAH!. {assetName} karate chops at\n {victimName} for {damage} damage',
    'SCREEEECH!. {assetName} chucks ninja\n stars at {victimName} for {damage} damage',
    'HMPH!. {assetName} throws a spear at\n {victimName} for {damage} damage',
    'SL-SL-SL-IIICE!. {assetName} slices and\n dices you {victimName} for {damage} damage',
];
/**
 * Returns random attack string injected with user info
 * @param assetName
 * @param victimName
 * @param damage
 * @returns {string}
 */
const getAttackString = (assetName, victimName, damage) => {
    return attackStrings[(0, helpers_1.randomNumber)(0, attackStrings.length)]
        .replace('{assetName}', assetName)
        .replace('{victimName}', victimName)
        .replace('{damage}', damage.toString());
};
exports.getAttackString = getAttackString;
/**
 *
 * @param attackerId
 * @param channelId
 * @returns {string}
 */
const getRandomVictimId = (attackerId, channelId) => {
    var _a;
    const game = __1.games[channelId];
    const filteredPlayerArray = Object.values(game.players).filter((player) => (player === null || player === void 0 ? void 0 : player.discordId) !== attackerId && !player.dead);
    const randomIndex = Math.floor(Math.random() * filteredPlayerArray.length);
    return (_a = filteredPlayerArray[randomIndex]) === null || _a === void 0 ? void 0 : _a.discordId;
};
exports.getRandomVictimId = getRandomVictimId;
/**
 * Returns RNG damage within a range
 * @param damageRange
 * @returns {number}
 */
const doDamage = (damageRange) => {
    return Math.floor(Math.random() * damageRange);
};
exports.doDamage = doDamage;
