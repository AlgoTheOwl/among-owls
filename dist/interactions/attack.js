"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const embeds_1 = __importDefault(require("../embeds"));
const attackCanvas_1 = __importDefault(require("../canvas/attackCanvas"));
const helpers_1 = require("../utils/helpers");
// Settings
const coolDownInterval = 5000;
const messageDeleteInterval = 7000;
async function attack(interaction, game, user, hp) {
    if (!interaction.isCommand())
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
    if (!attacker) {
        return interaction.reply({
            content: 'Please register by using the /register slash command to attack',
            ephemeral: true,
        });
    }
    if (!victim) {
        return interaction.reply({
            content: 'Intended victim is currently not registered, please try attacking another player',
            ephemeral: true,
        });
    }
    if (attacker.coolDownTimeLeft && attacker.coolDownTimeLeft > 0) {
        return interaction.reply({
            content: `HOO do you think you are? It’s not your turn! Wait ${attacker.coolDownTimeLeft / 1000} seconds`,
            ephemeral: true,
        });
    }
    const damage = Math.floor(Math.random() * (hp / 2));
    // const damage = 1000
    victim.hp -= damage;
    let victimDead = false;
    if (victim.hp <= 0) {
        // if victim is dead, delete from game
        delete game.players[victimId];
        victimDead = true;
    }
    const playerArr = Object.values(game.players);
    const isWin = (0, helpers_1.determineWin)(playerArr);
    // if there is only one player left, the game has been won
    if (isWin) {
        (0, helpers_1.handleWin)(playerArr, interaction);
    }
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
    (0, helpers_1.handleRolledRecently)(attacker, coolDownInterval);
    const embedData = {
        color: 'RED',
        fields: (0, helpers_1.mapPlayersForEmbed)(playerArr),
        image: undefined,
    };
    // if lose, remove loser from players and play game again
    await game.embed.edit((0, embeds_1.default)(embedData));
    await (0, helpers_1.wait)(messageDeleteInterval);
    await interaction.deleteReply();
}
exports.default = attack;
const attackStrings = [
    'HOOT, HOOT! {assetName} slashes at {victimName} for {damage} damage',
    'HI-YAH!. {assetName} karate chops at {victimName} for {damage} damage',
    'SCREEEECH!. {assetName} chucks ninja stars at {victimName} for {damage} damage',
    'HMPH!. {assetName} throws a spear at {victimName} for {damage} damage',
    'SL-SL-SL-IIICE!. {assetName} slices and dices you {victimName} for {damange} damage',
];
const getAttackString = (assetName, victimName, damage) => {
    return attackStrings[(0, helpers_1.randomNumber)(0, attackStrings.length)]
        .replace('{assetName}', assetName)
        .replace('{victimName}', victimName)
        .replace('{damage}', damage.toString());
};
