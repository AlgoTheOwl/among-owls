"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// Discord
const builders_1 = require("@discordjs/builders");
// Globals
const __1 = require("..");
const settings_1 = __importDefault(require("../settings"));
module.exports = {
    data: new builders_1.SlashCommandBuilder()
        .setName('begin-game')
        .setDescription('begin the game'),
    async execute(interaction) {
        const { user, channelId } = interaction;
        const { minCapacity } = settings_1.default[channelId];
        const game = __1.games[channelId];
        const playerArr = Object.values(game.players);
        if (!game.waitingRoom) {
            return interaction.reply({
                content: 'Game is not currently active. use the /start command to start the game',
                ephemeral: true,
            });
        }
        if (playerArr.length >= minCapacity) {
            game.waitingRoom = false;
            interaction.reply({
                content: `${user.username} has started the game`,
            });
            setTimeout(() => {
                interaction.deleteReply();
            }, 10000);
        }
        else {
            interaction.reply({
                content: `You can't start with less than ${minCapacity} players`,
                ephemeral: true,
            });
        }
    },
};
