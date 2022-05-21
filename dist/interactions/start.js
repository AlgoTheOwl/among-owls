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
const operations_1 = require("../database/operations");
const user_1 = __importDefault(require("../models/user"));
const game_1 = __importDefault(require("../models/game"));
const helpers_1 = require("../utils/helpers");
const embeds_1 = __importDefault(require("../embeds"));
function startGame(interaction, hp, imageDir) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!interaction.isCommand())
            return;
        // grab players
        const players = yield (0, operations_1.fetchPlayers)();
        const gamePlayers = {};
        yield (0, helpers_1.asyncForEach)(players, (player) => __awaiter(this, void 0, void 0, function* () {
            const { username, discordId, address, asset } = player;
            // save each image locally for use later
            const localPath = yield (0, helpers_1.downloadFile)(asset, imageDir, username);
            if (localPath) {
                const assetWithLocalPath = Object.assign(Object.assign({}, asset), { localPath });
                gamePlayers[discordId] = new user_1.default(username, discordId, address, assetWithLocalPath, hp, undefined);
            }
            else {
                // error downloading
                interaction.reply({
                    content: 'Error downloading asset from the blockchain',
                    ephemeral: true,
                });
            }
        }));
        // instansiate new game
        const game = new game_1.default(new Set(), gamePlayers, true, false, 1000);
        // send back game embed
        const embedData = {
            title: 'When AOWLS Attack',
            description: 'Who will survive?',
            color: 'DARK_AQUA',
            fields: Object.values(gamePlayers).map((player) => ({
                name: player.username,
                value: `${player.asset.assetName} HP: ${player.hp}`,
            })),
        };
        // if lose, remove loser from players and play game again
        game.embed = yield interaction.reply((0, embeds_1.default)(embedData));
        return game;
    });
}
exports.default = startGame;
