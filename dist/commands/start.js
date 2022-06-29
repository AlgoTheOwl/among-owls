"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const helpers_1 = require("../utils/helpers");
const embeds_1 = __importDefault(require("../embeds"));
const builders_1 = require("@discordjs/builders");
const helpers_2 = require("../utils/helpers");
const __1 = require("..");
const embeds_2 = __importDefault(require("../constants/embeds"));
const embeds_3 = __importDefault(require("../constants/embeds"));
const settings_1 = __importDefault(require("../settings"));
const database_service_1 = require("../database/database.service");
const roleId = process.env.ADMIN_ID;
module.exports = {
    data: new builders_1.SlashCommandBuilder()
        .setName('start')
        .setDescription('start When AOWLS Attack'),
    async execute(interaction) {
        if (!interaction.isCommand())
            return;
        const { maxCapacity, userCooldown } = settings_1.default;
        (0, helpers_1.resetGame)();
        const { user } = interaction;
        const hasRole = await (0, helpers_2.confirmRole)(roleId, interaction, user.id);
        if (!hasRole) {
            return await interaction.reply({
                content: 'Only administrators can use this command',
                ephemeral: true,
            });
        }
        if (__1.game === null || __1.game === void 0 ? void 0 : __1.game.active) {
            return await interaction.reply({
                content: 'A game is already running',
                ephemeral: true,
            });
        }
        await interaction.deferReply();
        const file = new discord_js_1.MessageAttachment('src/images/main.gif');
        // send embed here
        await interaction.editReply({ files: [file] });
        // Do waiting room
        __1.game.waitingRoom = true;
        let playerCount = 0;
        __1.game.embed = await interaction.followUp((0, embeds_1.default)(embeds_2.default.waitingRoom));
        while (playerCount < maxCapacity && __1.game.waitingRoom) {
            try {
                await (0, helpers_1.wait)(2000);
                playerCount = Object.values(__1.game.players).length;
                await __1.game.embed.edit((0, embeds_1.default)(embeds_2.default.waitingRoom));
            }
            catch (error) {
                // @ts-ignore
                console.log('ERROR', error);
            }
        }
        __1.game.waitingRoom = false;
        // Do countdown
        let countDown = 5;
        while (countDown >= 1) {
            countDown--;
            await (0, helpers_1.wait)(1000);
            await __1.game.embed.edit((0, embeds_1.default)(embeds_3.default.countDown, { countDown }));
        }
        // start game
        __1.game.active = true;
        __1.game.embed.edit((0, embeds_1.default)(embeds_2.default.activeGame));
        // Add user cooldown
        const playerArr = Object.values(__1.game.players);
        try {
            (0, helpers_1.asyncForEach)(playerArr, async (player) => {
                const coolDownDoneDate = Date.now() + userCooldown * 60000;
                await database_service_1.collections.users.findOneAndUpdate({ _id: player.userId }, { $set: { coolDownDone: coolDownDoneDate } });
            });
        }
        catch (error) {
            console.log(error);
        }
    },
};
