"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const builders_1 = require("@discordjs/builders");
const index_1 = require("../index");
const helpers_1 = require("../utils/helpers");
const asset_1 = __importDefault(require("../models/asset"));
const database_service_1 = require("../database/database.service");
const settings_1 = __importDefault(require("../settings"));
const player_1 = __importDefault(require("../models/player"));
module.exports = {
    data: new builders_1.SlashCommandBuilder()
        .setName('register-player')
        .setDescription('Register an active player'),
    async execute(interaction) {
        if (!interaction.isSelectMenu())
            return;
        const { values, user } = interaction;
        const { username, id } = user;
        const { imageDir, hp, messageDeleteInterval } = settings_1.default;
        const { assets, address, _id } = (await database_service_1.collections.users.findOne({
            discordId: user.id,
        }));
        const asset = assets.find((asset) => asset.assetId === Number(values[0]));
        if (!asset) {
            return;
        }
        const localPath = await (0, helpers_1.downloadFile)(asset, imageDir, username);
        if (!localPath) {
            return;
        }
        const gameAsset = new asset_1.default(asset.assetId, asset.assetName, asset.assetUrl, asset.unitName, undefined, localPath);
        index_1.game.players[id] = new player_1.default(username, id, address, gameAsset, _id, hp);
        interaction.reply(`${asset.assetName} has entered the game`);
        await (0, helpers_1.wait)(messageDeleteInterval);
        interaction.deleteReply();
    },
};
