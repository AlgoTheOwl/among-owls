"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const embeds_1 = __importDefault(require("../embeds"));
const attackCanvas_1 = __importDefault(require("../canvas/attackCanvas"));
const helpers_1 = require("../utils/helpers");
const __1 = require("..");
// Settings
const coolDownInterval = 5000;
const messageDeleteInterval = 7000;
const timeoutInterval = 30000;
async function attack(interaction, game, user, hp) {
    if (!interaction.isCommand() || !game.active)
        return;
    const { options } = interaction;
    const { id: victimId } = options.getUser('victim');
    const { id: attackerId } = user;
    if (victimId === attackerId) {
        return interaction.reply({
            content: `Owls are supposed to be wise, but you’re clearly not. You can’t attack yourself!`,
            ephemeral: true,
        });
    }
    const victim = game.players[victimId] ? game.players[victimId] : null;
    const attacker = game.players[attackerId] ? game.players[attackerId] : null;
    if (!attacker) {
        return interaction.reply({
            content: 'Please register by using the /register slash command to attack',
            ephemeral: true,
        });
    }
    if (attacker.dead) {
        return interaction.reply({
            content: `You can't attack, you're dead!`,
            ephemeral: true,
        });
    }
    if (attacker.coolDownTimeLeft && attacker.coolDownTimeLeft > 0) {
        return interaction.reply({
            content: `HOO do you think you are? It’s not your turn! Wait ${attacker.coolDownTimeLeft / 1000} seconds`,
            ephemeral: true,
        });
    }
    handleRolledRecently(attackerId, coolDownInterval);
    setPlayerTimeout(attackerId, timeoutInterval);
    if (attacker === null || attacker === void 0 ? void 0 : attacker.timedOut) {
        return interaction.reply({
            content: `Unfortunately, you've timed out due to inactivty.`,
            ephemeral: true,
        });
    }
    if (victim === null || victim === void 0 ? void 0 : victim.timedOut) {
        return interaction.reply({
            content: 'Unfortunately, this player has timed out due to inactivity',
            ephemeral: true,
        });
    }
    if (!victim) {
        return interaction.reply({
            content: 'Intended victim is currently not registered, please try attacking another player',
            ephemeral: true,
        });
    }
    const damage = Math.floor(Math.random() * (hp / 2));
    // const damage = 1000
    victim.hp -= damage;
    let victimDead = false;
    if (victim.hp <= 0) {
        // if victim is dead, delete from game
        game.players[victimId].dead = true;
        victimDead = true;
    }
    const playerArr = Object.values(game.players);
    const { username: victimName } = victim;
    const { username: attackerName, asset } = attacker;
    // do canvas with attacker, hp drained and victim
    const canvas = await (0, attackCanvas_1.default)(damage, asset, victimName, attackerName);
    const attachment = victimDead
        ? new discord_js_1.MessageAttachment('src/images/death.gif', 'death.gif')
        : new discord_js_1.MessageAttachment(canvas.toBuffer('image/png'), 'attacker.png');
    await interaction.reply({
        files: [attachment],
        content: victimDead
            ? `${attacker.asset.assetName} took ${victim.username} in one fell swoop. Owls be swoopin'`
            : getAttackString(attacker.asset.assetName, victim.username, damage),
    });
    const { winningPlayer, winByTimeout } = (0, helpers_1.getWinningPlayer)(playerArr);
    if (winningPlayer && game.active) {
        (0, helpers_1.handleWin)(winningPlayer, interaction, winByTimeout);
    }
    const embedData = {
        color: 'RED',
        fields: (0, helpers_1.mapPlayersForEmbed)(playerArr),
        image: undefined,
    };
    await game.embed.edit((0, embeds_1.default)(embedData));
    await (0, helpers_1.wait)(victimDead || winningPlayer ? 10000 : messageDeleteInterval);
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
const setPlayerTimeout = (playerId, timeoutInterval) => {
    const gamePlayer = __1.game.players[playerId];
    clearTimeout(playerTimeouts[playerId]);
    gamePlayer.rolledRecently = true;
    const rolledRecentlyTimeout = setTimeout(async () => {
        gamePlayer.rolledRecently = false;
    }, timeoutInterval);
    playerTimeouts[playerId] = rolledRecentlyTimeout;
};
const handleRolledRecently = async (playerId, coolDownInterval) => {
    const gamePlayer = __1.game.players[playerId];
    gamePlayer.coolDownTimeLeft = coolDownInterval;
    while (gamePlayer.coolDownTimeLeft >= 0) {
        await (0, helpers_1.wait)(1000);
        gamePlayer.coolDownTimeLeft -= 1000;
    }
};
