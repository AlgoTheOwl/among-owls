"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startWaitingRoom = void 0;
// Discord
const discord_js_1 = require("discord.js");
// Helpers
const helpers_1 = require("../utils/helpers");
const embeds_1 = __importDefault(require("../embeds"));
const runGame_1 = __importDefault(require("./runGame"));
// Globals
const settings_1 = __importDefault(require("../settings"));
const __1 = require("..");
// Schemas
const embeds_2 = __importDefault(require("../constants/embeds"));
const startWaitingRoom = () => __awaiter(void 0, void 0, void 0, function* () {
    const { maxCapacity } = settings_1.default;
    let capacity = maxCapacity;
    (0, helpers_1.resetGame)();
    __1.game.megatron = yield __1.channel.send((0, embeds_1.default)(embeds_2.default.waitingRoom));
    // Do waiting room
    __1.game.waitingRoom = true;
    let playerCount = 0;
    while (playerCount < capacity && __1.game.waitingRoom) {
        yield (0, helpers_1.wait)(2000);
        playerCount = Object.values(__1.game.players).length;
        yield __1.game.megatron.edit((0, embeds_1.default)(embeds_2.default.waitingRoom));
    }
    if (__1.game.waitingRoom)
        __1.game.waitingRoom = false;
    // Do countdown
    let countDown = 5;
    while (countDown >= 1) {
        yield sendCountdown(countDown, __1.channel);
        countDown--;
        yield (0, helpers_1.wait)(1000);
    }
    const file = new discord_js_1.MessageAttachment('src/images/main.gif');
    yield __1.game.megatron.edit({ files: [file], embeds: [], components: [] });
    // start game
    __1.game.active = true;
    __1.game.arena = yield __1.channel.send((0, embeds_1.default)(embeds_2.default.activeGame));
    yield sendVictimSelectMenu();
    (0, runGame_1.default)();
});
exports.startWaitingRoom = startWaitingRoom;
const sendCountdown = (countDown, channel) => __awaiter(void 0, void 0, void 0, function* () {
    const imagePath = `src/images/${countDown}.png`;
    const countDownImage = new discord_js_1.MessageAttachment(imagePath);
    if (!__1.game.megatron) {
        __1.game.megatron = yield channel.send({
            files: [countDownImage],
        });
    }
    else {
        __1.game.megatron.edit({ files: [countDownImage] });
    }
});
const sendVictimSelectMenu = () => __awaiter(void 0, void 0, void 0, function* () {
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
    yield __1.channel.send({
        components: [victimSelectMenu],
    });
});
