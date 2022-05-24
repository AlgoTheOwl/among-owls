"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const attackCanvas_1 = __importDefault(require("../canvas/attackCanvas"));
const helpers_1 = require("../utils/helpers");
const embeds_1 = __importDefault(require("../embeds"));
const helpers_2 = require("../utils/helpers");
// Settings
const coolDownInterval = 1000;
const messageDeleteInterval = 5000;
async function doTestAttack(interaction, game, hp) {
    if (!interaction.isCommand())
        return;
    if (!(game === null || game === void 0 ? void 0 : game.active))
        return interaction.reply(`Game is not running`);
    const victim = Object.values(game.players)[0];
    const attacker = Object.values(game.players)[1];
    if (game.rolledRecently.has(attacker.discordId)) {
        return await interaction.reply({
            content: 'Ah ah, still cooling down - wait your turn!',
            ephemeral: true,
        });
    }
    if (victim && attacker) {
        const { asset, username: victimName } = victim;
        const { username: attackerName } = attacker;
        const damage = Math.floor(Math.random() * (hp / 4));
        victim.hp -= damage;
        // do canvas with attacker, hp drained and victim
        const canvas = await (0, attackCanvas_1.default)(damage, asset, victimName, attackerName);
        const attachment = new discord_js_1.MessageAttachment(canvas.toBuffer('image/png'), 'attacker.png');
        await interaction.reply({
            files: [attachment],
            content: `${victim.username} gets wrecked by ${attacker.asset.assetName} for ${damage} damage`,
        });
        (0, helpers_1.handleRolledRecently)(attacker, game, coolDownInterval);
        const playerArr = Object.values(game.players);
        const embedData = {
            fields: (0, helpers_1.mapPlayersForEmbed)(playerArr),
            color: 'RED',
        };
        await game.embed.edit((0, embeds_1.default)(embedData));
        await (0, helpers_2.wait)(messageDeleteInterval);
        await interaction.deleteReply();
    }
}
exports.default = doTestAttack;
