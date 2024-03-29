"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// Discord
const discord_js_1 = require("discord.js");
const embeds_1 = __importDefault(require("./constants/embeds"));
// Game state
const _1 = require(".");
// Helpers
const helpers_1 = require("./utils/helpers");
const defaultEmbedValues = {
    title: '🔥 Ye Among AOWLs 🔥',
    description: '💀 Who will survive? 💀',
    color: 'DarkAqua',
    image: 'attachment://main.gif',
    // thumbNail: 'https://www.randgallery.com/wp-content/uploads/2021/11/owl.jpg',
    footer: {
        text: 'A HootGang Production',
        iconUrl: 'https://www.randgallery.com/wp-content/uploads/2021/11/owl.jpg',
    },
    rawEmbed: false,
};
/**
 * Takes embed type and returns Discord message embed object for easy use within commands
 * TODO: move all "options" and async operations into doEmbed function to reduce clutter at command level
 * @param type
 * @param channelId
 * @param options
 * @returns {MessagePayload | InteractionReplyOptions | EmbedBuilder | MessageOptions}
 */
function doEmbed(type, channelId, options) {
    let data = {};
    let components = [];
    const game = _1.games[channelId];
    // Waiting Room
    if (type === embeds_1.default.waitingRoom) {
        const playerArr = Object.values(game === null || game === void 0 ? void 0 : game.players);
        const playerCount = playerArr.length;
        const playerWord = playerCount === 1 ? 'player' : 'players';
        const hasWord = playerCount === 1 ? 'has' : 'have';
        data = {
            title: '🦉 Waiting Room 🦉',
            description: `${playerCount} ${playerWord} ${hasWord} joined the game.`,
            files: [],
            fields: playerArr.map((player) => {
                return {
                    name: player.username,
                    value: player.asset.alias || player.asset.assetName,
                };
            }),
        };
        components.push(new discord_js_1.ActionRowBuilder().addComponents(new discord_js_1.ButtonBuilder()
            .setCustomId('select-attacker')
            .setLabel('Choose your AOWL')
            .setStyle(discord_js_1.ButtonStyle.Primary), new discord_js_1.ButtonBuilder()
            .setCustomId('begin-game')
            .setLabel('Start game')
            .setStyle(discord_js_1.ButtonStyle.Secondary), new discord_js_1.ButtonBuilder()
            .setCustomId('withdraw-player')
            .setLabel('Withdraw AOWL')
            .setStyle(discord_js_1.ButtonStyle.Danger)));
    }
    if (type === embeds_1.default.activeGame) {
        const playerArr = Object.values(game === null || game === void 0 ? void 0 : game.players);
        const fields = (options === null || options === void 0 ? void 0 : options.hasOwnProperty('fields'))
            ? options.fields
            : (0, helpers_1.mapPlayersForEmbed)(playerArr, 'game');
        data = {
            title: '🔥 Ye Among AOWLs 🔥',
            description: '💀 Who will survive? 💀',
            color: 'Random',
            image: undefined,
            fields,
            footer: {
                text: 'A HootGang Production',
            },
        };
    }
    // Players timed out
    if (type === embeds_1.default.timedOut) {
        data = {
            title: 'BOOOO!!!',
            description: 'Game has ended due to all players being removed for inactivity',
        };
    }
    // Win
    if (options && type === embeds_1.default.win) {
        const { player, hootOnWin } = options;
        const asserUrl = player.asset.assetUrl;
        const { asset, username } = player;
        const { alias, assetName } = asset;
        data = {
            title: 'WINNER!!!',
            description: `${username}'s ${alias || assetName} ${`destroyed the competition and won ${hootOnWin} hoot!`}`,
            color: 'DarkAqua',
            image: (0, helpers_1.normalizeIpfsUrl)(asserUrl),
        };
    }
    // Leaderboard
    if (options && type === embeds_1.default.leaderBoard) {
        const { fields, description } = options;
        data = {
            title: 'Leaderboard',
            description,
            fields,
        };
    }
    // Stopped game
    if (type === embeds_1.default.stopped) {
        data = {
            title: 'Game stopped',
            description: 'Game has been stopped',
        };
    }
    // User Profile
    if (type === embeds_1.default.profile) {
        const { thumbNail, fields } = options;
        data = {
            rawEmbed: true,
            thumbNail,
            fields,
            title: 'Your Profile',
            description: '',
        };
    }
    // Asset Profile
    if (type === embeds_1.default.assetProfile) {
        const { assetUrl, fields, assetName } = options;
        data = {
            title: assetName,
            description: `Your lil' ripper`,
            thumbNail: (0, helpers_1.normalizeIpfsUrl)(assetUrl),
            fields,
            footer: {
                text: '*** Hint: Use /rename here to rename this asset ***',
            },
        };
    }
    let { title, description, color, image, thumbNail, fields, footer, files, rawEmbed, } = Object.assign(Object.assign({}, defaultEmbedValues), data);
    const embed = new discord_js_1.EmbedBuilder();
    let thumbNailUrl;
    if (thumbNail) {
        thumbNailUrl = (0, helpers_1.normalizeIpfsUrl)(thumbNail);
    }
    title && embed.setTitle(title);
    description && embed.setDescription(description);
    color && embed.setColor(color);
    image && embed.setImage(image);
    thumbNailUrl && embed.setThumbnail(thumbNailUrl);
    (fields === null || fields === void 0 ? void 0 : fields.length) && embed.addFields(fields);
    footer && embed.setFooter(footer);
    if (rawEmbed) {
        return embed;
    }
    return {
        embeds: [embed],
        fetchReply: true,
        //@ts-ignore
        components,
        files: (files === null || files === void 0 ? void 0 : files.length) ? files : undefined,
    };
}
exports.default = doEmbed;
