"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
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
    execute(interaction) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!interaction.isSelectMenu())
                    return;
                if (!index_1.game.waitingRoom)
                    return;
                const { values, user } = interaction;
                const assetId = values[0];
                const { username, id } = user;
                const { imageDir, hp, messageDeleteInterval } = settings_1.default;
                yield interaction.deferReply({ ephemeral: true });
                const { assets, address, _id, coolDowns } = (yield database_service_1.collections.users.findOne({
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
                    localPath = yield (0, helpers_1.downloadFile)(asset, imageDir, username);
                }
                catch (error) {
                    console.log('download error', error);
                }
                if (!localPath) {
                    return;
                }
                const gameAsset = new asset_1.default(asset.assetId, asset.assetName, asset.assetUrl, asset.unitName, _id, localPath);
                index_1.game.players[id] = new player_1.default(username, id, address, gameAsset, _id, hp, Object.values(assets).length, 0);
                yield interaction.editReply(`${asset.assetName} has entered the game`);
                yield (0, helpers_1.wait)(messageDeleteInterval);
            }
            catch (error) {
                console.log(error);
            }
        });
    },
};
