"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const helpers_1 = require("../utils/helpers");
const __1 = require("..");
const embeds_1 = __importDefault(require("../embeds"));
const embeds_2 = __importDefault(require("../constants/embeds"));
const settings_1 = __importDefault(require("../settings"));
const roleId = process.env.ADMIN_ID;
async function start(channel) {
    const { maxCapacity } = settings_1.default;
    let capacity = maxCapacity;
    (0, helpers_1.resetGame)();
    __1.game.embed = await channel.send((0, embeds_1.default)(embeds_2.default.waitingRoom));
    // Do waiting room
    __1.game.waitingRoom = true;
    let playerCount = 0;
    while (playerCount < capacity) {
        await (0, helpers_1.wait)(2000);
        playerCount = Object.values(__1.game.players).length;
        await __1.game.embed.edit((0, embeds_1.default)(embeds_2.default.waitingRoom));
    }
    __1.game.waitingRoom = false;
    // Do countdown
    let countDown = 5;
    while (countDown >= 1) {
        countDown--;
        await (0, helpers_1.wait)(1000);
        await __1.game.embed.edit((0, embeds_1.default)(embeds_2.default.countDown, { countDown }));
    }
    // start game
    __1.game.active = true;
    __1.game.embed.edit((0, embeds_1.default)(embeds_2.default.activeGame));
    // runGame(interaction)
}
exports.default = start;
