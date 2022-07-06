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
module.exports = {
    data: new builders_1.SlashCommandBuilder()
        .setName('start')
        .setDescription('start When AOWLS Attack'),
    async execute(interaction) {
        if (!interaction.isCommand())
            return;
        const { maxCapacity } = settings_1.default;
        if ((__1.game === null || __1.game === void 0 ? void 0 : __1.game.active) || (__1.game === null || __1.game === void 0 ? void 0 : __1.game.waitingRoom)) {
            return await interaction.reply({
                content: 'A game is already running',
                ephemeral: true,
            });
        }
        (0, helpers_1.resetGame)();
        await interaction.deferReply();
        const file = new discord_js_1.MessageAttachment('src/images/main.gif');
        // send embed here
        await interaction.editReply({ files: [file] });
        // Do waiting room
        __1.game.waitingRoom = true;
        let playerCount = 0;
        __1.game.embed = await interaction.followUp((0, embeds_1.default)(embeds_2.default.waitingRoom));
        while (playerCount < maxCapacity && __1.game.waitingRoom && !__1.game.stopped) {
            try {
                await (0, helpers_1.wait)(2000);
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
        // Do countdown
        let countDown = 5;
        while (countDown > 0 && !__1.game.stopped) {
            await (0, helpers_1.wait)(1000);
            const imagePath = `src/images/${countDown}.png`;
            const countDownImage = new discord_js_1.MessageAttachment(imagePath);
            await interaction.editReply({ files: [countDownImage] });
            countDown--;
        }
        if (!__1.game.stopped) {
            // send embed here
            interaction.editReply({ files: [file] });
            // start game
            __1.game.active = true;
            __1.game.embed.edit((0, embeds_1.default)(embeds_2.default.activeGame));
            // Add user cooldown
            // const playerArr = Object.values(game.players)
            // try {
            //   asyncForEach(playerArr, async (player: Player) => {
            //     const coolDownDoneDate = Date.now() + userCooldown * 60000
            //     await collections.users.findOneAndUpdate(
            //       { _id: player.userId },
            //       { $set: { coolDownDone: coolDownDoneDate } }
            //     )
            //   })
            // } catch (error) {
            //   console.log(error)
            // }
        }
    },
};
