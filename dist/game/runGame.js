"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// Helpers
const helpers_1 = require("../utils/helpers");
const gameplay_1 = require("../utils/gameplay");
const attack_1 = require("../utils/attack");
const attack_2 = require("../utils/attack");
const win_1 = require("./win");
const embeds_1 = __importDefault(require("../embeds"));
// Globals
const __1 = require("..");
const embeds_2 = __importDefault(require("../constants/embeds"));
const settings_1 = require("../utils/settings");
/**
 * Runs main game logic incrementally
 * Loops through each player and triggers specific or randopm attack
 * Updated embed to show attack and current player HP, update game state stats
 * @param channel {TextChannel}
 */
async function runGame(channel, playerArr) {
    const { id: channelId } = channel;
    try {
        const game = __1.games[channelId];
        const { damageRange } = await (0, settings_1.getSettings)(channelId);
        let isWin = false;
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
                if (attacker && !(attacker === null || attacker === void 0 ? void 0 : attacker.dead) && game.active) {
                    // SELECT VICTIM
                    if (player.victimId && !game.players[player.victimId].dead) {
                        victim = game.players[player.victimId];
                    }
                    else {
                        victim = game.players[(0, attack_2.getRandomVictimId)(discordId, channelId)];
                    }
                    if (victim) {
                        const damage = (0, attack_1.doDamage)(damageRange);
                        victim.hp -= damage;
                        if (victim.hp <= 0 && attacker) {
                            victim.dead = true;
                            attacker.asset.kos++;
                            player.kos++;
                        }
                        // HANDLE WIN
                        const winningPlayer = (0, gameplay_1.getWinningPlayer)(playerArr);
                        isWin = !!winningPlayer;
                        if (isWin && winningPlayer && game.active) {
                            (0, win_1.handleWin)(winningPlayer, channel);
                        }
                        // REFRESH EMBED
                        const attackField = {
                            name: 'ATTACK',
                            value: (0, attack_2.getAttackString)(attacker.asset.alias || attacker.asset.assetName, victim.username, damage),
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
                }
            });
        }
        game.rounds++;
    }
    catch (error) {
        console.log('****** ERROR RUNNNINGS GAME ******', error);
        (0, gameplay_1.resetGame)(false, channelId);
    }
}
exports.default = runGame;
