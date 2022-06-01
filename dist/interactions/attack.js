"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const embeds_1 = __importDefault(require("../embeds"));
const attackCanvas_1 = __importDefault(require("../canvas/attackCanvas"));
const helpers_1 = require("../utils/helpers");
const database_service_1 = require("../database/database.service");
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
    if (attacker.coolDownTimeLeft && attacker.coolDownTimeLeft > 0) {
        return interaction.reply({
            content: `Ah, ah, not your turn yet wait ${attacker.coolDownTimeLeft / 1000} seconds`,
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
    // if there is only one player left, the game has been won
    if (playerArr.length === 1) {
        const winner = playerArr[0];
        // handle win
        game.active = false;
        // Increment score of winning player
        const winningUser = (await database_service_1.collections.users.findOne({
            _id: winner.userId,
        }));
        const updatedScore = winningUser.yaoWins ? winningUser.yaoWins + 1 : 1;
        await database_service_1.collections.users.findOneAndUpdate({}, { $set: { yaoWins: updatedScore } });
        const embedData = {
            title: 'WINNER!!!',
            description: `${winner.username}'s ${winner.asset.unitName} destroyed the competition`,
            color: 'DARK_AQUA',
            image: winner.asset.assetUrl,
        };
        // collections.players.deleteMany({})
        interaction.reply({ ephemeral: true, content: 'You WON!!!' });
        return game.embed.edit((0, embeds_1.default)(embedData));
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
            ? `${attacker.asset.assetName} has eliminated ${victim.username}!!!`
            : `${attacker.asset.assetName} attacks ${victim.username} for ${damage} damage`,
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
