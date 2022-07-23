"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const helpers_1 = require("../utils/helpers");
const __1 = require("..");
const embeds_1 = __importDefault(require("../embeds"));
const embeds_2 = __importDefault(require("../constants/embeds"));
const settings_1 = __importDefault(require("../settings"));
const runGame_1 = __importDefault(require("./runGame"));
const __2 = require("..");
async function startWaitingRoom() {
    const { maxCapacity } = settings_1.default;
    let capacity = maxCapacity;
    (0, helpers_1.resetGame)();
    __1.game.megatron = await __2.channel.send((0, embeds_1.default)(embeds_2.default.waitingRoom));
    // Do waiting room
    __1.game.waitingRoom = true;
    let playerCount = 0;
    while (playerCount < capacity && __1.game.waitingRoom) {
        await (0, helpers_1.wait)(2000);
        playerCount = Object.values(__1.game.players).length;
        await __1.game.megatron.edit((0, embeds_1.default)(embeds_2.default.waitingRoom));
    }
    if (__1.game.waitingRoom)
        __1.game.waitingRoom = false;
    // Do countdown
    let countDown = 5;
    while (countDown >= 1) {
        await sendCountdown(countDown, __2.channel);
        countDown--;
        await (0, helpers_1.wait)(1000);
    }
    const file = new discord_js_1.MessageAttachment('src/images/main.gif');
    await __1.game.megatron.edit({ files: [file], embeds: [], components: [] });
    // start game
    __1.game.active = true;
    __1.game.arena = await __2.channel.send((0, embeds_1.default)(embeds_2.default.activeGame));
    await sendVictimSelectMenu();
    (0, runGame_1.default)();
}
exports.default = startWaitingRoom;
const sendCountdown = async (countDown, channel) => {
    const imagePath = `src/images/${countDown}.png`;
    const countDownImage = new discord_js_1.MessageAttachment(imagePath);
    if (!__1.game.megatron) {
        __1.game.megatron = await channel.send({
            files: [countDownImage],
        });
    }
    else {
        __1.game.megatron.edit({ files: [countDownImage] });
    }
};
const sendVictimSelectMenu = async () => {
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
    await __2.channel.send({
        components: [victimSelectMenu],
    });
};
