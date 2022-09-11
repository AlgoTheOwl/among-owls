"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.rmDir = exports.downloadAssetImage = void 0;
const helpers_1 = require("./helpers");
const fs_1 = __importDefault(require("fs"));
const axios_1 = __importDefault(require("axios"));
/**
 * Stores image fetched from url locally
 * @param asset
 * @param directory
 * @param username
 * @returns {string | void}
 */
const downloadAssetImage = async (asset, directory, username) => {
    try {
        const { assetUrl } = asset;
        if (assetUrl) {
            const url = (0, helpers_1.normalizeIpfsUrl)(assetUrl);
            const path = `${directory}/${username
                .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, '')
                .trim()}.jpg`;
            const writer = fs_1.default.createWriteStream(path);
            const res = await axios_1.default.get(url, {
                responseType: 'stream',
            });
            res.data.pipe(writer);
            return new Promise((resolve, reject) => {
                writer.on('finish', () => {
                    return resolve(path);
                });
            });
        }
    }
    catch (error) {
        console.log('****** ERROR DOWNLOADING ASSET IMAGE ******', error);
    }
};
exports.downloadAssetImage = downloadAssetImage;
/**
 * Empties specified directory
 * @param dirPath
 * @returns {void}
 */
const rmDir = (dirPath) => fs_1.default.rm(dirPath, { recursive: true }, () => { });
exports.rmDir = rmDir;
