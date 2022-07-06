"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const builders_1 = require("@discordjs/builders");
const database_service_1 = require("../database/database.service");
const __1 = require("..");
const settings_1 = __importDefault(require("../settings"));
module.exports = {
    data: new builders_1.SlashCommandBuilder()
        .setName('select-attacker')
        .setDescription(`Pick which AOWL you'd like to compete`),
    async execute(interaction) {
        var _a, _b;
        try {
            const { user: { id }, } = interaction;
            const { maxAssets } = settings_1.default;
            if (!__1.game.waitingRoom) {
                return interaction.reply({
                    content: 'Game is not currently active. Use the /start command to start the game',
                    ephemeral: true,
                });
            }
            await interaction.deferReply({ ephemeral: true });
            const data = (await database_service_1.collections.users.findOne({
                discordId: id,
            }));
            if (!(data === null || data === void 0 ? void 0 : data.assets.length)) {
                return interaction.editReply({
                    content: 'You have no AOWLs to select!',
                });
            }
            if ((data === null || data === void 0 ? void 0 : data.coolDownDone) && data.coolDownDone > Date.now()) {
                const minutesLeft = Math.floor((data.coolDownDone - Date.now()) / 60000);
                const minuteWord = minutesLeft === 1 ? 'minute' : 'minutes';
                return interaction.editReply({
                    content: `Please wait ${minutesLeft} ${minuteWord} before playing again`,
                });
            }
            const options = data.assets
                .map((asset, i) => {
                var _a;
                if (i < maxAssets) {
                    return {
                        label: asset.assetName,
                        description: 'Select to play',
                        value: (_a = asset === null || asset === void 0 ? void 0 : asset.assetId) === null || _a === void 0 ? void 0 : _a.toString(),
                    };
                }
            })
                .filter(Boolean);
            const selectMenu = new discord_js_1.MessageSelectMenu()
                .setCustomId('register-player')
                .setPlaceholder('Select an AOWL to attack');
            if (options.length) {
                selectMenu.addOptions(options);
            }
            const row = new discord_js_1.MessageActionRow().addComponents(selectMenu);
            await interaction.editReply({
                content: 'Choose your AOWL',
                components: [row],
            });
        }
        catch (error) {
            console.log('ERROR SELECTING');
            console.log(error);
            //@ts-ignore
            console.log((_b = (_a = error === null || error === void 0 ? void 0 : error.requestData) === null || _a === void 0 ? void 0 : _a.json) === null || _b === void 0 ? void 0 : _b.components);
        }
    },
};
