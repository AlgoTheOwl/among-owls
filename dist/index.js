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
const user_1 = __importDefault(require("./models/user"));
const embeds_1 = __importDefault(require("./services/embeds"));
const discord_js_1 = require("discord.js");
const helpers_1 = require("./utils/helpers");
const register_1 = require("./utils/register");
const database_service_1 = require("./services/database.service");
const operations_1 = require("./services/operations");
const game_1 = __importDefault(require("./models/game"));
const users_1 = __importDefault(require("./mocks/users"));
const attackCanvas_1 = __importDefault(require("./canvas/attackCanvas"));
let queInterval;
// Settings
const token = process.env.DISCORD_TOKEN;
const hp = 1000;
const eventQue = [];
const imageDir = 'dist/images';
const client = new discord_js_1.Client({
    intents: [discord_js_1.Intents.FLAGS.GUILDS, discord_js_1.Intents.FLAGS.GUILD_EMOJIS_AND_STICKERS],
});
client.once('ready', () => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, database_service_1.connectToDatabase)();
    console.log('When Owls Attack - Server ready');
}));
client.on('interactionCreate', (interaction) => __awaiter(void 0, void 0, void 0, function* () {
    if (!interaction.isCommand())
        return;
    const { commandName, options, user } = interaction;
    if (commandName === 'start') {
        interaction.deferReply();
        // grab players
        const players = yield (0, operations_1.fetchPlayers)();
        const gamePlayers = {};
        yield (0, helpers_1.asyncForEach)(players, (player) => __awaiter(void 0, void 0, void 0, function* () {
            const { username, discordId, address, asset } = player;
            // save each image locally for use later
            const localPath = yield (0, helpers_1.downloadFile)(asset, imageDir, username);
            if (localPath) {
                const assetWithLocalPath = Object.assign(Object.assign({}, asset), { localPath });
                gamePlayers[discordId] = new user_1.default(username, discordId, address, assetWithLocalPath, hp, undefined);
            }
            else {
                // error downloading
            }
            // loop through event que and show attacks
            queInterval = setInterval(() => __awaiter(void 0, void 0, void 0, function* () {
                if (eventQue.length) {
                    const { victim: { asset }, attacker: { username }, damage, } = eventQue[0];
                    // do canvas with attacker, hp drained and victim
                    const canvas = (0, attackCanvas_1.default)(damage, asset, username);
                    const attachment = new discord_js_1.MessageAttachment(canvas.toBuffer('image/png'), 'test-melt.png');
                    yield interaction.reply({ files: [attachment] });
                }
            }), 3000);
        }));
        // instansiate new game
        exports.game = new game_1.default(gamePlayers, true, false, 1000);
        // send back game embed
        const embedData = {
            title: 'When Owls Attack',
            description: 'Test description',
            color: 'DARK_AQUA',
            fields: Object.values(gamePlayers).map((player) => ({
                name: player.username,
                value: `HP: ${player.hp}`,
            })),
        };
        // if lose, remove loser from players and play game again
        exports.game.embed = yield interaction.reply((0, embeds_1.default)(embedData));
    }
    if (commandName === 'register') {
        const address = options.getString('address');
        const assetId = options.getNumber('assetid');
        const { username, id } = user;
        if (address && assetId) {
            const registrant = new user_1.default(username, id, address, { assetId }, hp);
            const { status, asset } = yield (0, register_1.processRegistration)(registrant);
            const embedData = {
                title: 'Register',
                description: status,
                image: asset === null || asset === void 0 ? void 0 : asset.assetUrl,
                color: 'BLURPLE',
            };
            yield interaction.reply((0, embeds_1.default)(embedData));
        }
    }
    if (commandName === 'attack') {
        const { id: attackerId } = user;
        if (!(exports.game === null || exports.game === void 0 ? void 0 : exports.game.active))
            return interaction.reply(`The game hasn't started yet, please register if you haven't already and try again later`);
        const { id: victimId } = options.getUser('victim');
        const victim = exports.game.players[victimId] ? null : exports.game.players[victimId];
        const attacker = exports.game.players[attackerId] ? null : exports.game.players[attackerId];
        if (victim && attacker) {
            const damage = Math.floor(Math.random() * (hp / 2));
            victim.hp -= damage;
            // if victim is dead, delete from game
            if (victim.hp <= 0) {
                delete exports.game.players[victimId];
            }
            // if there is only one player left, the game has been won
            if (Object.values(exports.game.players).length === 1) {
                // handle win
                exports.game.active = false;
                interaction.reply('winner');
            }
            // push event to the eventQue
            eventQue.push({
                attacker,
                victim,
                damage,
            });
            return;
        }
        // either victom or attacker doesn't exist
        return interaction.reply('Please register by using the /register slash command to attack');
    }
    if (commandName === 'stop') {
        if (!(exports.game === null || exports.game === void 0 ? void 0 : exports.game.active))
            return interaction.reply('Game is not currently running');
        exports.game.active = false;
        return interaction.reply('game stopped');
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
}));
client.login(token);
