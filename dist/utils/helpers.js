"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizeIpfsUrl = exports.isIpfs = exports.randomSort = exports.randomNumber = exports.getNumberSuffix = exports.mapPlayersForEmbed = exports.asyncForEach = exports.wait = void 0;
const ipfsGateway = process.env.IPFS_GATEWAY || 'https://dweb.link/ipfs/';
/**
 * Wait asycronously
 * @param duration
 */
const wait = async (duration) => {
    await new Promise((res) => {
        setTimeout(res, duration);
    });
};
exports.wait = wait;
/**
 * Loop for async operations
 * @param array
 * @param callback
 */
const asyncForEach = async (array, callback) => {
    for (let index = 0; index < array.length; index++) {
        await callback(array[index], index, array);
    }
};
exports.asyncForEach = asyncForEach;
/**
 * Maps out entered players for embed fields
 * @param playerArr
 * @param type
 * @returns {{ name: string; value: string }[]}
 */
const mapPlayersForEmbed = (playerArr, type) => {
    const fields = playerArr.map((player) => {
        let value;
        if (player.dead || player.hp <= 0) {
            value = '💀';
        }
        else {
            value =
                type === 'game'
                    ? `HP: ${player.hp}`
                    : `${player.asset.alias || player.asset.assetName}`;
        }
        return {
            name: player.username,
            value,
        };
    });
    return (0, exports.randomSort)(fields);
};
exports.mapPlayersForEmbed = mapPlayersForEmbed;
/**
 * Returns readable number suffix
 * @param num
 * @returns {string}
 */
const getNumberSuffix = (num) => {
    if (num === 1)
        return '1st';
    if (num === 2)
        return '2nd';
    if (num === 3)
        return '3rd';
    else
        return `${num}th`;
};
exports.getNumberSuffix = getNumberSuffix;
/**
 * Prooducs random number within range
 * @param min
 * @param max
 * @returns {number}
 */
const randomNumber = (min, max) => Math.floor(Math.random() * (max - min) + min);
exports.randomNumber = randomNumber;
const randomSort = (arr) => {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * i);
        const k = arr[i];
        arr[i] = arr[j];
        arr[j] = k;
    }
    return arr;
};
exports.randomSort = randomSort;
/**
 * Determines if url is an IPFS locater
 * @param url
 * @returns
 */
const isIpfs = (url) => (url === null || url === void 0 ? void 0 : url.slice(0, 4)) === 'ipfs';
exports.isIpfs = isIpfs;
/**
 * Converst IPFS url to http url for consumption in game
 * @param url
 * @returns
 */
const normalizeIpfsUrl = (url) => {
    if ((0, exports.isIpfs)(url)) {
        const ifpsHash = url.slice(7);
        return `${ipfsGateway}${ifpsHash}`;
    }
    else {
        return url;
    }
};
exports.normalizeIpfsUrl = normalizeIpfsUrl;
