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
const fs_1 = __importDefault(require("fs"));
// Globals
const index_1 = require("../index");
const settings_1 = require("../utils/settings");
module.exports = {
    data: new builders_1.SlashCommandBuilder()
        .setName('register-player')
        .setDescription('Register an active player'),
    /**
     * Select menu command that registers a chosen asset into battle
     * @param interaction {SelectMenuInteraction}
     * @returns {void}
     */
    async execute(interaction) {
        try {
            if (!interaction.isSelectMenu())
                return;
            const { values, user, channelId } = interaction;
            const game = index_1.games[channelId];
            if (!game.waitingRoom)
                return;
            const assetId = values[0];
            const { username, id } = user;
            const { hp, maxCapacity } = await (0, settings_1.getSettings)(channelId);
            // Check if user is another game
            if ((0, helpers_1.checkIfRegisteredPlayer)(index_1.games, assetId, id)) {
                return interaction.reply({
                    ephemeral: true,
                    content: `You can't register with the same AOWL in two games at a time`,
                });
            }
            // Check for game capacity, allow already registered user to re-register
            // even if capacity is full
            if (Object.values(game.players).length < maxCapacity ||
                game.players[id]) {
                await interaction.deferReply({ ephemeral: true });
                const { assets, address, _id, coolDowns, holdingsRefreshDate } = (await database_service_1.collections.users.findOne({
                    discordId: user.id,
                }));
                const asset = assets[assetId];
                if (holdingsRefreshDate < Date.now()) {
                }
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
                    // Create file for channel and download image
                    const path = `dist/nftAssets/${channelId}`;
                    if (!fs_1.default.existsSync(path)) {
                        fs_1.default.mkdir(path, (err) => { });
                    }
                    localPath = await (0, helpers_1.downloadFile)(asset, path, username);
                }
                catch (error) {
                    console.log('****** ERROR DOWNLOADING ******', error);
                }
                if (!localPath) {
                    return;
                }
                const gameAsset = new asset_1.default(asset.assetId, asset.assetName, asset.assetUrl, asset.unitName, asset.wins || 0, asset.losses || 0, asset.kos || 0, _id, localPath, asset.alias);
                // check again for capacity once added
                if (Object.values(game.players).length >= maxCapacity &&
                    !game.players[id]) {
                    return interaction.editReply('Sorry, the game is at capacity, please wait until the next round');
                }
                game.players[id] = new player_1.default(username, id, address, gameAsset, hp);
                await interaction.editReply(`${asset.alias || asset.assetName} has entered the game`);
                (0, helpers_1.updateGame)(channelId);
            }
            else {
                interaction.reply({
                    content: 'Sorry, the game is at capacity, please wait until the next round',
                    ephemeral: true,
                });
            }
        }
        catch (error) {
            console.log('****** ERROR REGISTERING ******', error);
        }
    },
};
