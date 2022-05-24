"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const embeds_1 = __importDefault(require("../embeds"));
const attackCanvas_1 = __importDefault(require("../canvas/attackCanvas"));
const helpers_1 = require("../utils/helpers");
const operations_1 = require("../database/operations");
// Settings
const coolDownInterval = 5000;
const messageDeleteInterval = 5000;
async function attack(interaction, game, user, hp) {
    if (!interaction.isCommand())
        return;
    const { options } = interaction;
    const { id: victimId } = options.getUser('victim');
    const { id: attackerId } = user;
    if (victimId === attackerId) {
        return interaction.reply({
            content: `Unfortunately, you can't attack yourself, please try again!`,
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
    if (!victim) {
        return interaction.reply({
            content: 'Intended victim is currently not registered, please try attacking another player',
            ephemeral: true,
        });
    }
    if (attacker.coolDownTimeLeft > 0) {
        return interaction.reply({
            content: `Ah, ah, not your turn yet wait ${attacker.coolDownTimeLeft / 1000} seconds`,
            ephemeral: true,
        });
    }
    const damage = Math.floor(Math.random() * (hp / 2));
    // const damage = 1000
    victim.hp -= damage;
    // if victim is dead, delete from game
    if (victim.hp <= 0) {
        delete game.players[victimId];
    }
    const playerArr = Object.values(game.players);
    // if there is only one player left, the game has been won
    if (playerArr.length === 1) {
        const winner = playerArr[0];
        // handle win
        game.active = false;
        const embedData = {
            title: 'WINNER!!!',
            description: `${winner.username}'s ${winner.asset.unitName} destroyed the competition`,
            color: 'DARK_AQUA',
            image: winner.asset.assetUrl,
        };
        await (0, operations_1.removeAllPlayers)();
        interaction.reply({ ephemeral: true, content: 'You WON!!!' });
        return game.embed.edit((0, embeds_1.default)(embedData));
    }
    const { asset, username: victimName } = victim;
    const { username: attackerName } = attacker;
    // do canvas with attacker, hp drained and victim
    const canvas = await (0, attackCanvas_1.default)(damage, asset, victimName, attackerName);
    const attachment = new discord_js_1.MessageAttachment(canvas.toBuffer('image/png'), 'attacker.png');
    await interaction.reply({
        files: [attachment],
        content: 'Test content for attack',
    });
    (0, helpers_1.handleRolledRecently)(attacker, coolDownInterval);
    const embedData = {
        color: 'RED',
        fields: (0, helpers_1.mapPlayersForEmbed)(playerArr),
    };
    // if lose, remove loser from players and play game again
    await game.embed.edit((0, embeds_1.default)(embedData));
    await (0, helpers_1.wait)(messageDeleteInterval);
    await interaction.deleteReply();
}
exports.default = attack;
