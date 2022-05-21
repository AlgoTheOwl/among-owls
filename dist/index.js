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
exports.game = void 0;
const embeds_1 = __importDefault(require("./database/embeds"));
const discord_js_1 = require("discord.js");
const helpers_1 = require("./utils/helpers");
const register_1 = require("./utils/register");
const database_service_1 = require("./database/database.service");
const users_1 = __importDefault(require("./mocks/users"));
const attackCanvas_1 = __importDefault(require("./canvas/attackCanvas"));
const start_1 = __importDefault(require("./interactions/start"));
const attack_1 = __importDefault(require("./interactions/attack"));
const token = process.env.DISCORD_TOKEN;
// Settings
const hp = 1000;
const imageDir = 'dist/images';
const coolDownInterval = 1000;
const client = new discord_js_1.Client({
    intents: [discord_js_1.Intents.FLAGS.GUILDS, discord_js_1.Intents.FLAGS.GUILD_EMOJIS_AND_STICKERS],
});
client.once('ready', () => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, database_service_1.connectToDatabase)();
    console.log('When Owls Attack - Server ready');
}));
/*
 *****************
 * COMMAND SERVER *
 *****************
 */
client.on('interactionCreate', (interaction) => __awaiter(void 0, void 0, void 0, function* () {
    if (!interaction.isCommand())
        return;
    const { commandName, user } = interaction;
    if (commandName === 'start') {
        exports.game = yield (0, start_1.default)(interaction, hp, imageDir);
    }
    if (commandName === 'attack') {
        if (!(exports.game === null || exports.game === void 0 ? void 0 : exports.game.active))
            return interaction.reply({
                content: `The game hasn't started yet, please register if you haven't already and try again later`,
                ephemeral: true,
            });
        (0, attack_1.default)(interaction, exports.game, user, hp);
    }
    if (commandName === 'stop') {
        if (!(exports.game === null || exports.game === void 0 ? void 0 : exports.game.active))
            return interaction.reply('Game is not currently running');
        exports.game.active = false;
        return interaction.reply({ content: 'Game stopped', ephemeral: true });
    }
    /*
     *****************
     * TEST COMMANDS *
     *****************
     */
    // test registring and selecting players
    if (commandName === 'setup-test') {
        yield (0, helpers_1.asyncForEach)(users_1.default, (user, i) => __awaiter(void 0, void 0, void 0, function* () {
            yield (0, register_1.processRegistration)(user);
            console.log(`test user ${i + 1} added`);
        }));
    }
    // test pushing attack event to que
    if (commandName === 'attack-test') {
        // interaction.deferReply({ ephemeral: true })
        if (!(exports.game === null || exports.game === void 0 ? void 0 : exports.game.active))
            return interaction.reply(`Game is not running`);
        const victim = Object.values(exports.game.players)[0];
        const attacker = Object.values(exports.game.players)[1];
        if (exports.game.rolledRecently.has(attacker.discordId)) {
            return yield interaction.reply({
                content: 'Ah ah, still cooling down - wait your turn!',
                ephemeral: true,
            });
        }
        if (victim && attacker) {
            const { asset, username: victimName } = victim;
            const { username: attackerName } = attacker;
            const damage = Math.floor(Math.random() * (hp / 2));
            victim.hp -= damage;
            // do canvas with attacker, hp drained and victim
            const canvas = yield (0, attackCanvas_1.default)(damage, asset, victimName, attackerName);
            const attachment = new discord_js_1.MessageAttachment(canvas.toBuffer('image/png'), 'attacker.png');
            yield interaction.reply({ files: [attachment] });
            handleRolledRecently(attacker);
            const embedData = {
                title: 'When Owls Attack',
                description: 'Who will survive?',
                color: 'DARK_AQUA',
                fields: Object.values(exports.game.players).map((player) => ({
                    name: player.username,
                    value: `${player.asset.unitName} - ${player.hp}`,
                })),
            };
            exports.game.embed.edit((0, embeds_1.default)(embedData));
            yield (0, helpers_1.wait)(5000);
            interaction.deleteReply();
        }
    }
}));
const handleRolledRecently = (user) => {
    exports.game === null || exports.game === void 0 ? void 0 : exports.game.rolledRecently.add(user.discordId);
    setTimeout(() => {
        exports.game === null || exports.game === void 0 ? void 0 : exports.game.rolledRecently.delete(user.discordId);
    }, coolDownInterval + 1500);
};
client.login(token);
