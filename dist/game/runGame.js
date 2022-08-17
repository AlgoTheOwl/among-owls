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
async function runGame(channel) {
    const { id: channelId } = channel;
    try {
        const game = __1.games[channelId];
        const playerArr = Object.values(game.players);
        const { damagePerAowl, damageRange } = settings_1.default[channelId];
        let isWin = false;
        let handlingDeath = false;
        // MAIN GAME LOOP
        while (!game.stopped &&
            !game.waitingRoom &&
            game.active &&
            playerArr.length > 1) {
            await (0, helpers_1.asyncForEach)(playerArr, async (player) => {
                if (!player.dead) {
                    await (0, helpers_1.wait)(2000);
                }
                const { discordId } = player;
                const attacker = game.players[discordId];
                let victim;
                // DO DAMAGE
                if (attacker && !(attacker === null || attacker === void 0 ? void 0 : attacker.timedOut) && !(attacker === null || attacker === void 0 ? void 0 : attacker.dead) && game.active) {
                    if (player.victimId && !game.players[player.victimId].dead) {
                        victim = game.players[player.victimId];
                    }
                    else {
                        victim = game.players[(0, attack_1.getRandomVictimId)(discordId, channelId)];
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
                    if (isWin && winningPlayer && game.active) {
                        (0, win_1.handleWin)(winningPlayer, winByTimeout, channel);
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
                    await game.arena.edit((0, embeds_1.default)(embeds_2.default.activeGame, channelId, { fields }));
                    if (isWin) {
                        return;
                    }
                }
            });
        }
    }
    catch (error) {
        console.log(error);
        (0, helpers_1.resetGame)(false, channelId);
    }
}
exports.default = runGame;
