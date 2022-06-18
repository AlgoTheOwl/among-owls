"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const helpers_1 = require("../utils/helpers");
const embeds_1 = __importDefault(require("../embeds"));
const helpers_2 = require("../utils/helpers");
const builders_1 = require("@discordjs/builders");
const helpers_3 = require("../utils/helpers");
const __1 = require("..");
const settings_1 = __importDefault(require("../settings"));
const { minimumPlayers } = settings_1.default;
const roleId = process.env.ADMIN_ID;
module.exports = {
    data: new builders_1.SlashCommandBuilder()
        .setName('start')
        .setDescription('start When AOWLS Attack')
        .addNumberOption((option) => option
        .setName('capacity')
        .setDescription('max amount of players allowed in a single game')),
    async execute(interaction) {
        if (!interaction.isCommand())
            return;
        const { user, options } = interaction;
        const capacity = options.getNumber('capacity') || minimumPlayers;
        console.log(capacity);
        const hasRole = await (0, helpers_3.confirmRole)(roleId, interaction, user.id);
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
        const waitingRoomEmbedData = {
            image: undefined,
            title: 'Waiting Room',
            description: '0 players have joined the game',
            isWaitingRoom: true,
        };
        __1.game.embed = await interaction.followUp((0, embeds_1.default)(waitingRoomEmbedData));
        while (playerCount < capacity) {
            try {
                await (0, helpers_1.wait)(2000);
                playerCount = Object.values(__1.game.players).length;
                await __1.game.embed.edit((0, embeds_1.default)(Object.assign(Object.assign({}, waitingRoomEmbedData), { description: `${playerCount} ${playerCount === 1 ? 'player' : 'players'} have joined the game` })));
            }
            catch (error) {
                // @ts-ignore
                console.log('ERROR', error);
            }
        }
        // Do countdown
        let countDown = 5;
        while (countDown >= 1) {
            countDown--;
            await (0, helpers_1.wait)(1000);
            const embedData = {
                title: 'Ready your AOWLS!',
                description: `Game starting in ${countDown}...`,
            };
            await __1.game.embed.edit((0, embeds_1.default)(embedData));
        }
        const playerArr = Object.values(__1.game.players);
        // send back game embed
        const embedData = {
            image: undefined,
            fields: (0, helpers_2.mapPlayersForEmbed)(playerArr),
            description: 'Leaderboard',
            isMain: true,
        };
        // start game
        __1.game.active = true;
        __1.game.embed.edit((0, embeds_1.default)(embedData));
    },
};
