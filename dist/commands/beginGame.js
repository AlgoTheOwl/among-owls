"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const builders_1 = require("@discordjs/builders");
const __1 = require("..");
const settings_1 = __importDefault(require("../settings"));
module.exports = {
    data: new builders_1.SlashCommandBuilder()
        .setName('begin-game')
        .setDescription('begin the game'),
    async execute(interaction) {
        const { user } = interaction;
        const { minCapacity } = settings_1.default;
        const playerArr = Object.values(__1.game.players);
        if (playerArr.length >= minCapacity) {
            __1.game.waitingRoom = false;
            interaction.reply({
                content: `${user.username} has started the game`,
            });
            setTimeout(() => {
                interaction.deleteReply();
            }, 5000);
        }
        else {
            interaction.reply({
                content: `You can't start with less than ${minCapacity} players`,
                ephemeral: true,
            });
        }
    },
};
