"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const builders_1 = require("@discordjs/builders");
const helpers_1 = require("../utils/helpers");
const register_1 = require("./register");
const users_1 = __importDefault(require("../mocks/users"));
const settings_1 = __importDefault(require("../settings"));
const roleId = process.env.ADMIN_ID;
module.exports = {
    data: new builders_1.SlashCommandBuilder()
        .setName('test-register')
        .setDescription('register multiple mock users'),
    async execute(interaction) {
        if (!interaction.isCommand())
            return;
        const { user } = interaction;
        const { hp } = settings_1.default;
        const hasRole = await (0, helpers_1.confirmRole)(roleId, interaction, user.id);
        if (!hasRole) {
            return await interaction.reply({
                content: 'Only administrators can use this command',
                ephemeral: true,
            });
        }
        await (0, helpers_1.asyncForEach)(users_1.default, async (player, i) => {
            const { username, discordId, address, assetId } = player;
            await (0, register_1.processRegistration)(username, discordId, address);
        });
        await interaction.reply({
            content: 'all test users added',
            ephemeral: true,
        });
    },
};
