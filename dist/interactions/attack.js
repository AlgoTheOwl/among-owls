"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const embeds_1 = __importDefault(require("../embeds"));
const attackCanvas_1 = __importDefault(require("../canvas/attackCanvas"));
const helpers_1 = require("../utils/helpers");
const coolDownInterval = 1000;
function attack(interaction, game, user, hp) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!interaction.isCommand())
            return;
        const { options } = interaction;
        const { id: victimId } = options.getUser('victim');
        const { id: attackerId } = user;
        const victim = game.players[victimId] ? null : game.players[victimId];
        const attacker = game.players[attackerId] ? null : game.players[attackerId];
        if (!attacker) {
            return interaction.reply({
                content: 'Please register by using the /register slash command to attack',
                ephemeral: true,
            });
        }
        if (!victim) {
            return interaction.reply({
                content: 'Intended victim is currently not registered for WOA, please try attacking another player',
                ephemeral: true,
            });
        }
        if (game.rolledRecently.has(attacker.discordId)) {
            return interaction.reply({
                content: 'Ah ah, still cooling down - wait your turn!',
                ephemeral: true,
            });
        }
        const playerArray = Object.values(game.players);
        const damage = Math.floor(Math.random() * (hp / 4));
        victim.hp -= damage;
        // if victim is dead, delete from game
        if (victim.hp <= 0) {
            delete game.players[victimId];
        }
        // if there is only one player left, the game has been won
        if (playerArray.length === 1) {
            const winner = playerArray[0];
            // handle win
            game.active = false;
            const embedData = {
                title: 'WINNER!!!',
                description: `${winner.username}'s ${winner.asset.unitName} destroyed the competition`,
                color: 'DARK_AQUA',
            };
            game.embed.edit((0, embeds_1.default)(embedData));
        }
        const { asset, username: victimName } = victim;
        const { username: attackerName } = attacker;
        // do canvas with attacker, hp drained and victim
        const canvas = yield (0, attackCanvas_1.default)(damage, asset, victimName, attackerName);
        const attachment = new discord_js_1.MessageAttachment(canvas.toBuffer('image/png'), 'attacker.png');
        yield interaction.reply({
            files: [attachment],
            content: 'Test content for attack',
        });
        (0, helpers_1.handleRolledRecently)(attacker, game, coolDownInterval);
        const embedData = {
            title: 'When AOWLS Attack',
            description: 'Who will survive?',
            color: 'DARK_AQUA',
            fields: playerArray.map((player) => ({
                name: player.username,
                value: `${player.asset.unitName} - HP: ${player.hp}`,
            })),
        };
        // if lose, remove loser from players and play game again
        yield game.embed.edit((0, embeds_1.default)(embedData));
        yield (0, helpers_1.wait)(5000);
        yield interaction.deleteReply();
    });
}
exports.default = attack;
