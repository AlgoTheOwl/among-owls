"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const embeds_1 = __importDefault(require("../embeds"));
// import doAttackCanvas from '../canvas/attackCanvas'
const helpers_1 = require("../utils/helpers");
const __1 = require("..");
const settings_1 = __importDefault(require("../settings"));
const { timeoutInterval, coolDownInterval, messageDeleteInterval, deathDeleteInterval, } = settings_1.default;
async function attack(interaction, game, user, hp) {
    if (!game.active)
        return;
    const { values: idArr } = interaction;
    const victimId = idArr[0];
    const { id: attackerId } = user;
    const victim = game.players[victimId] ? game.players[victimId] : null;
    const attacker = game.players[attackerId] ? game.players[attackerId] : null;
    const stillCoolingDown = (attacker === null || attacker === void 0 ? void 0 : attacker.coolDownTimeLeft) && (attacker === null || attacker === void 0 ? void 0 : attacker.coolDownTimeLeft) > 0;
    const canAttack = attacker &&
        victim &&
        !stillCoolingDown &&
        !victim.timedOut &&
        !attacker.timedOut &&
        victimId !== attackerId;
    const playerArr = Object.values(game.players);
    let victimDead;
    let isWin;
    // Begin watching for player inactivity
    handlePlayerTimeout(attackerId, timeoutInterval);
    let replied;
    if (victimId === attackerId) {
        interaction.reply({
            content: `Owls are supposed to be wise, but you’re clearly not. You can’t attack yourself!`,
            ephemeral: true,
        });
        replied = true;
    }
    if (!attacker && !replied) {
        interaction.reply({
            content: 'Please register by using the /register slash command to attack',
            ephemeral: true,
        });
        replied = true;
    }
    if (!victim && !replied) {
        interaction.reply({
            content: 'Intended victim is currently not registered, please try attacking another player',
            ephemeral: true,
        });
        replied = true;
    }
    if ((attacker === null || attacker === void 0 ? void 0 : attacker.dead) && !replied) {
        interaction.reply({
            content: `You can't attack, you're dead!`,
            ephemeral: true,
        });
        replied = true;
    }
    if ((victim === null || victim === void 0 ? void 0 : victim.dead) && !replied) {
        interaction.reply({
            content: `Your intended victim is already dead!`,
            ephemeral: true,
        });
        replied = true;
    }
    if ((attacker === null || attacker === void 0 ? void 0 : attacker.coolDownTimeLeft) && stillCoolingDown && !replied) {
        interaction.reply({
            content: `HOO do you think you are? It’s not your turn! Wait ${attacker.coolDownTimeLeft / 1000} seconds`,
            ephemeral: true,
        });
        replied = true;
    }
    if ((attacker === null || attacker === void 0 ? void 0 : attacker.timedOut) && !replied) {
        interaction.reply({
            content: `Unfortunately, you've timed out due to inactivty.`,
            ephemeral: true,
        });
        replied = true;
    }
    if ((victim === null || victim === void 0 ? void 0 : victim.timedOut) && !replied) {
        interaction.reply({
            content: 'Unfortunately, this player has timed out due to inactivity',
            ephemeral: true,
        });
        replied = true;
    }
    if (canAttack) {
        // Only start cooldown if attack actually happens
        handlePlayerCooldown(attackerId, coolDownInterval);
        const damage = Math.floor(Math.random() * (hp / 2));
        // const damage = 1000
        victim.hp -= damage;
        victimDead = false;
        if (victim.hp <= 0) {
            // if victim is dead, delete from game
            game.players[victimId].dead = true;
            victimDead = true;
        }
        const { username: victimName } = victim;
        const { asset: attackerAsset } = attacker;
        if (victimDead) {
            const attachment = new discord_js_1.MessageAttachment('src/images/death.gif', 'death.gif');
            await interaction.reply({
                files: [attachment],
                content: `${attacker.asset.assetName} took ${victim.username} in one fell swoop. Owls be swoopin'`,
            });
        }
        else {
            interaction.reply(getAttackString(attackerAsset.assetName, victimName, damage));
        }
        const { winningPlayer, winByTimeout } = (0, helpers_1.getWinningPlayer)(playerArr);
        isWin = !!winningPlayer;
        console.log('is Win', isWin);
        console.log('winning player', winningPlayer);
        if (isWin && winningPlayer && game.active) {
            (0, helpers_1.handleWin)(winningPlayer, winByTimeout);
        }
    }
    const embedData = {
        color: 'RED',
        fields: (0, helpers_1.mapPlayersForEmbed)(playerArr),
        image: undefined,
        isMain: true,
    };
    await game.embed.edit((0, embeds_1.default)(embedData));
    await (0, helpers_1.wait)(victimDead || isWin ? deathDeleteInterval : messageDeleteInterval);
    await interaction.deleteReply();
}
exports.default = attack;
/*
 *****************
 **** HELPERS ****
 *****************
 */
const attackStrings = [
    'HOOT, HOOT! {assetName} slashes at {victimName} for {damage} damage',
    'HI-YAH!. {assetName} karate chops at {victimName} for {damage} damage',
    'SCREEEECH!. {assetName} chucks ninja stars at {victimName} for {damage} damage',
    'HMPH!. {assetName} throws a spear at {victimName} for {damage} damage',
    'SL-SL-SL-IIICE!. {assetName} slices and dices you {victimName} for {damage} damage',
];
const getAttackString = (assetName, victimName, damage) => {
    return attackStrings[(0, helpers_1.randomNumber)(0, attackStrings.length)]
        .replace('{assetName}', assetName)
        .replace('{victimName}', victimName)
        .replace('{damage}', damage.toString());
};
const playerTimeouts = {};
const handlePlayerTimeout = (playerId, timeoutInterval) => {
    const gamePlayer = __1.game.players[playerId];
    clearTimeout(playerTimeouts[playerId]);
    gamePlayer.rolledRecently = true;
    const rolledRecentlyTimeout = setTimeout(async () => {
        gamePlayer.rolledRecently = false;
    }, timeoutInterval);
    playerTimeouts[playerId] = rolledRecentlyTimeout;
};
const handlePlayerCooldown = async (playerId, coolDownInterval) => {
    const gamePlayer = __1.game.players[playerId];
    gamePlayer.coolDownTimeLeft = coolDownInterval;
    while (gamePlayer.coolDownTimeLeft >= 0) {
        await (0, helpers_1.wait)(1000);
        gamePlayer.coolDownTimeLeft -= 1000;
    }
};
