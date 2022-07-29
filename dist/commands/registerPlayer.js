"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const builders_1 = require("@discordjs/builders");
// Data
const database_service_1 = require("../database/database.service");
// Schemas
const asset_1 = __importDefault(require("../models/asset"));
const player_1 = __importDefault(require("../models/player"));
// Helpers
const helpers_1 = require("../utils/helpers");
// Globals
const index_1 = require("../index");
const settings_1 = __importDefault(require("../settings"));
module.exports = {
    data: new builders_1.SlashCommandBuilder()
        .setName('register-player')
        .setDescription('Register an active player'),
    async execute(interaction) {
        try {
            if (!interaction.isSelectMenu())
                return;
            if (!index_1.game.waitingRoom)
                return;
            // await updateTransactions()
            const { values, user } = interaction;
            const assetId = values[0];
            const { username, id } = user;
            const { imageDir, hp } = settings_1.default;
            await interaction.deferReply({ ephemeral: true });
            const { assets, address, _id, coolDowns } = (await database_service_1.collections.users.findOne({
                discordId: user.id,
            }));
            const asset = assets[assetId];
            if (!asset) {
                return;
            }
            const coolDown = coolDowns ? coolDowns[assetId] : null;
            if (coolDown && coolDown > Date.now()) {
                const minutesLeft = Math.floor((coolDown - Date.now()) / 60000);
                const minuteWord = minutesLeft === 1 ? 'minute' : 'minutes';
                return interaction.editReply({
                    content: `Please wait ${minutesLeft} ${minuteWord} before playing ${asset.assetName} again`,
                });
            }
            let localPath;
            try {
                localPath = await (0, helpers_1.downloadFile)(asset, imageDir, username);
            }
            catch (error) {
                console.log('download error', error);
            }
            if (!localPath) {
                return;
            }
            const gameAsset = new asset_1.default(asset.assetId, asset.assetName, asset.assetUrl, asset.unitName, _id, localPath);
            index_1.game.players[id] = new player_1.default(username, id, address, gameAsset, _id, hp, Object.values(assets).length, 0);
            await interaction.editReply(`${asset.assetName} has entered the game`);
            index_1.game.update = true;
            setTimeout(() => {
                index_1.game.update = false;
            }, 3000);
        }
        catch (error) {
            console.log(error);
        }
    },
};
