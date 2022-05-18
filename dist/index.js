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
const user_1 = __importDefault(require("./models/user"));
const embeds_1 = __importDefault(require("./services/embeds"));
const discord_js_1 = require("discord.js");
const register_1 = require("./utils/register");
const database_service_1 = require("./services/database.service");
const token = process.env.DISCORD_TOKEN;
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
        // start game with options
    }
    if (commandName === 'register') {
        // interaction.deferReply();
        const address = options.getString('address');
        const assetId = options.getNumber('assetid');
        const { username, id } = interaction.user;
        if (address && assetId) {
            const registrant = new user_1.default(username, id, address, { assetId });
            const { status, asset, registeredUser } = yield (0, register_1.processRegistration)(registrant, address, assetId);
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
        // const player = options.getOption('player');
    }
    /*
     *****************
     * TEST COMMANDS *
     *****************
     */
    // test registring and selecting players
    if (commandName === 'setup-test') {
    }
    // for testing purposes
}));
client.login(token);
