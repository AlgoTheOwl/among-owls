"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const helpers_1 = require("../utils/helpers");
const embeds_1 = __importDefault(require("../embeds"));
const builders_1 = require("@discordjs/builders");
const __1 = require("..");
const embeds_2 = __importDefault(require("../constants/embeds"));
const settings_1 = __importDefault(require("../settings"));
const runGame_1 = __importDefault(require("../commandUtils/runGame"));
module.exports = {
    data: new builders_1.SlashCommandBuilder()
        .setName('start')
        .setDescription('start When AOWLS Attack'),
    enabled: true,
    async execute(interaction) {
        if (!interaction.isCommand())
            return;
        const { maxCapacity, waitingRoomRefreshRate } = settings_1.default;
        (0, helpers_1.resetGame)();
        await interaction.deferReply();
        /*
         ************
         * MEGATRON *
         ************
         */
        const file = new discord_js_1.MessageAttachment('src/images/main.gif');
        await interaction.editReply({ files: [file] });
        /*
         ****************
         * WAITING ROOM *
         ****************
         */
        __1.game.waitingRoom = true;
        let playerCount = 0;
        __1.game.embed = await interaction.followUp((0, embeds_1.default)(embeds_2.default.waitingRoom));
        while (playerCount < maxCapacity && __1.game.waitingRoom && !__1.game.stopped) {
            try {
                await (0, helpers_1.wait)(waitingRoomRefreshRate);
                playerCount = Object.values(__1.game.players).length;
                !__1.game.stopped &&
                    (await __1.game.embed.edit((0, embeds_1.default)(embeds_2.default.waitingRoom)));
            }
            catch (error) {
                // @ts-ignore
                console.log('ERROR', error);
            }
        }
        __1.game.waitingRoom = false;
        /*
         *************
         * COUNTDOWN *
         *************
         */
        let countDown = 5;
        while (countDown > 0 && !__1.game.stopped) {
            await (0, helpers_1.wait)(1000);
            const imagePath = `src/images/${countDown}.png`;
            const countDownImage = new discord_js_1.MessageAttachment(imagePath);
            await interaction.editReply({ files: [countDownImage] });
            countDown--;
        }
        /*
         ***************
         * ACTIVE GAME *
         ***************
         */
        if (!__1.game.stopped) {
            interaction.editReply({ files: [file] });
            __1.game.embed.edit((0, embeds_1.default)(embeds_2.default.activeGame));
            __1.game.active = true;
            // Do Game
            (0, runGame_1.default)(interaction);
            // Send Victim Select Menu
            const playerArr = Object.values(__1.game.players);
            const victims = playerArr
                .filter((player) => !player.timedOut && !player.dead)
                .map((player) => ({
                label: `Attack ${player.username}`,
                description: '',
                value: player.discordId,
            }));
            const victimSelectMenu = new discord_js_1.MessageActionRow().addComponents(new discord_js_1.MessageSelectMenu()
                .setCustomId('select-victim')
                .setPlaceholder('Attack a random victim')
                .addOptions([
                {
                    label: `Attack a random victim`,
                    description: '',
                    value: 'random',
                },
                ...victims,
            ]));
            interaction.followUp({
                components: [victimSelectMenu],
            });
        }
    },
};
