"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const __1 = require("..");
const helpers_1 = require("../utils/helpers");
const attack_1 = require("./attack");
const settings_1 = __importDefault(require("../settings"));
async function runGame() {
    if (__1.game.active || __1.game.waitingRoom) {
        return;
    }
    const { players } = __1.game;
    const { autoGameSettings } = settings_1.default;
    const { roundIntervalLength } = autoGameSettings;
    const playerArr = Object.values(players);
    __1.intervals.autoGameInterval = setInterval(async () => {
        await (0, helpers_1.asyncForEach)(playerArr, async (player) => {
            const { discordId } = player;
            const attacker = __1.game.players[discordId];
            let victim;
            if (!(attacker === null || attacker === void 0 ? void 0 : attacker.timedOut) && !(attacker === null || attacker === void 0 ? void 0 : attacker.dead)) {
                if (player.victimId) {
                    victim = __1.game.players[player.victimId];
                }
                else {
                    victim = __1.game.players[(0, attack_1.getRandomVictimId)(discordId)];
                }
                const damage = (0, helpers_1.doDamage)(attacker, false);
                victim.hp -= damage;
            }
        });
    }, roundIntervalLength);
}
exports.default = runGame;
