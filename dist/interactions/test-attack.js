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
const attackCanvas_1 = __importDefault(require("../canvas/attackCanvas"));
const helpers_1 = require("../utils/helpers");
const embeds_1 = __importDefault(require("../embeds"));
const helpers_2 = require("../utils/helpers");
// Settings
const coolDownInterval = 1000;
const messageDeleteInterval = 5000;
function doTestAttack(interaction, game, hp) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!interaction.isCommand())
            return;
        if (!(game === null || game === void 0 ? void 0 : game.active))
            return interaction.reply(`Game is not running`);
        const victim = Object.values(game.players)[0];
        const attacker = Object.values(game.players)[1];
        if (game.rolledRecently.has(attacker.discordId)) {
            return yield interaction.reply({
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
            const canvas = yield (0, attackCanvas_1.default)(damage, asset, victimName, attackerName);
            const attachment = new discord_js_1.MessageAttachment(canvas.toBuffer('image/png'), 'attacker.png');
            yield interaction.reply({
                files: [attachment],
                content: `${victim.username} gets wrecked by ${attacker.asset.assetName} for ${damage} damage`,
            });
            (0, helpers_1.handleRolledRecently)(attacker, game, coolDownInterval);
            const embedData = {
                title: '🔥🦉🔥 When AOWLS Attack 🔥🦉🔥',
                description: '💀 Who will survive? 💀',
                color: 'RED',
                image: 'https://external-content.duckduckgo.com/iu/?u=http%3A%2F%2Fweirdlystrange.com%2Fwp-content%2Fuploads%2F2015%2F12%2Fowl004.jpg&f=1&nofb=1',
                thumbNail: 'https://www.randgallery.com/wp-content/uploads/2021/11/owl.jpg',
                fields: Object.values(game.players).map((player) => ({
                    name: player.username,
                    value: `${player.asset.assetName} - HP: ${player.hp}`,
                })),
                footer: {
                    text: 'test footer content',
                    iconUrl: 'https://www.randgallery.com/wp-content/uploads/2021/11/owl.jpg',
                },
            };
            yield game.embed.edit((0, embeds_1.default)(embedData));
            yield (0, helpers_2.wait)(messageDeleteInterval);
            yield interaction.deleteReply();
        }
    });
}
exports.default = doTestAttack;
