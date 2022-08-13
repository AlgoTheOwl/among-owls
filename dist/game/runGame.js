"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// Helpers
const helpers_1 = require("../utils/helpers");
const attack_1 = require("../utils/attack");
const win_1 = require("./win");
const embeds_1 = __importDefault(require("../embeds"));
// Globals
const __1 = require("..");
const embeds_2 = __importDefault(require("../constants/embeds"));
const settings_1 = __importDefault(require("../settings"));
async function runGame(channelId) {
    try {
        const { players } = __1.game;
        const playerArr = Object.values(players);
        const { damagePerAowl, damageRange } = settings_1.default[channelId];
        let isWin = false;
        let handlingDeath = false;
        // MAIN GAME LOOP
        while (!__1.game.stopped &&
            !__1.game.waitingRoom &&
            __1.game.active &&
            playerArr.length > 1) {
            await (0, helpers_1.asyncForEach)(playerArr, async (player) => {
                if (!player.dead) {
                    await (0, helpers_1.wait)(2000);
                }
                const { discordId } = player;
                const attacker = __1.game.players[discordId];
                let victim;
                // DO DAMAGE
                if (attacker && !(attacker === null || attacker === void 0 ? void 0 : attacker.timedOut) && !(attacker === null || attacker === void 0 ? void 0 : attacker.dead) && __1.game.active) {
                    if (player.victimId && !__1.game.players[player.victimId].dead) {
                        victim = __1.game.players[player.victimId];
                    }
                    else {
                        victim = __1.game.players[(0, attack_1.getRandomVictimId)(discordId)];
                    }
                    const damage = (0, helpers_1.doDamage)(attacker, false, damagePerAowl, damageRange);
                    if (victim) {
                        victim.hp -= damage;
                    }
                    // HANDLE DEATH
                    if (victim.hp <= 0 && attacker && !handlingDeath) {
                        victim.dead = true;
                    }
                    // HANDLE WIN
                    const { winningPlayer, winByTimeout } = (0, helpers_1.getWinningPlayer)(playerArr);
                    isWin = !!winningPlayer;
                    if (isWin && winningPlayer && __1.game.active) {
                        (0, win_1.handleWin)(winningPlayer, winByTimeout, channelId);
                    }
                    // REFRESH EMBED
                    const attackField = {
                        name: 'ATTACK',
                        value: (0, attack_1.getAttackString)(attacker.asset.alias || attacker.asset.assetName, victim.username, damage),
                    };
                    const fields = [
                        ...(0, helpers_1.mapPlayersForEmbed)(playerArr, 'game'),
                        attackField,
                    ].filter(Boolean);
                    await __1.game.arena.edit((0, embeds_1.default)(embeds_2.default.activeGame, { fields }));
                    if (isWin) {
                        return;
                    }
                }
            });
        }
    }
    catch (error) {
        console.log(error);
        (0, helpers_1.resetGame)();
    }
}
exports.default = runGame;
