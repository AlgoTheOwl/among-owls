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
async function runGame() {
    try {
        const { players } = __1.game;
        const playerArr = Object.values(players);
        let isWin = false;
        let handlingDeath = false;
        // MAIN GAME LOOP
        while (!__1.game.stopped &&
            !__1.game.waitingRoom &&
            __1.game.active &&
            playerArr.length > 1) {
            await (0, helpers_1.asyncForEach)(playerArr, async (player) => {
                await (0, helpers_1.wait)(2000);
                const { discordId } = player;
                const attacker = __1.game.players[discordId];
                let victim;
                // DO DAMAGE
                if (attacker && !(attacker === null || attacker === void 0 ? void 0 : attacker.timedOut) && !(attacker === null || attacker === void 0 ? void 0 : attacker.dead) && __1.game.active) {
                    if (player.victimId) {
                        victim = __1.game.players[player.victimId];
                    }
                    else {
                        victim = __1.game.players[(0, attack_1.getRandomVictimId)(discordId)];
                    }
                    const damage = (0, helpers_1.doDamage)(attacker, false);
                    victim.hp -= damage;
                    // HANDLE DEATH
                    if (victim.hp <= 0 && attacker && !handlingDeath) {
                        victim.dead = true;
                        // handlingDeath = true
                        // const attachment = new MessageAttachment(
                        //   'src/images/death.gif',
                        //   'death.gif'
                        // )
                        // await game.megatron.edit({
                        //   files: [attachment],
                        //   content: `${attacker.asset.assetName} took ${victim.username} in one fell swoop. Owls be swoopin'`,
                        // })
                        // setTimeout(async () => {
                        //   const file = new MessageAttachment('src/images/main.gif')
                        //   await game.megatron.edit({ files: [file] })
                        //   handlingDeath = false
                        // }, deathDeleteInterval)
                    }
                    // HANDLE WIN
                    const { winningPlayer, winByTimeout } = (0, helpers_1.getWinningPlayer)(playerArr);
                    isWin = !!winningPlayer;
                    if (isWin && winningPlayer && __1.game.active) {
                        return (0, win_1.handleWin)(winningPlayer, winByTimeout);
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
