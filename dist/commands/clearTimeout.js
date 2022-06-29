"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const builders_1 = require("@discordjs/builders");
const __1 = require("..");
const helpers_1 = require("../utils/helpers");
const database_service_1 = require("../database/database.service");
const settings_1 = __importDefault(require("../settings"));
module.exports = {
    data: new builders_1.SlashCommandBuilder()
        .setName('start')
        .setDescription('start When AOWLS Attack'),
    async execute(interaction) {
        if (!interaction.isCommand())
            return;
        const { userCooldown } = settings_1.default;
        const playerArr = Object.values(__1.game.players);
        interaction.deferReply({ ephemeral: true });
        (0, helpers_1.asyncForEach)(playerArr, async (player) => {
            await database_service_1.collections.users.findOneAndUpdate({ _id: player.userId }, { $set: { coolDownDone: null } });
        });
        return await interaction.editReply('Timeouts cleared');
    },
};
