"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const _1 = require(".");
const embeds_1 = __importDefault(require("./constants/embeds"));
const helpers_1 = require("./utils/helpers");
const ipfsGateway = process.env.IPFS_GATEWAY;
const defaultEmbedValues = {
    title: '🔥 Ye Among AOWLs 🔥',
    description: '💀 Who will survive? 💀',
    color: 'DARK_AQUA',
    image: 'attachment://main.gif',
    thumbNail: 'https://www.randgallery.com/wp-content/uploads/2021/11/owl.jpg',
    footer: {
        text: 'A HootGang Production',
        iconUrl: 'https://www.randgallery.com/wp-content/uploads/2021/11/owl.jpg',
    },
};
function doEmbed(type, options) {
    let data = {};
    let components = [];
    const playerArr = Object.values(_1.game.players);
    const playerCount = playerArr.length;
    if (type === embeds_1.default.waitingRoom) {
        const playerWord = playerCount === 1 ? 'player' : 'players';
        const hasWord = playerCount === 1 ? 'has' : 'have';
        data = {
            title: '🦉 Waiting Room 🦉',
            description: `${playerCount} ${playerWord} ${hasWord} joined the game.`,
            fields: playerArr.map((player) => {
                return {
                    name: player.username,
                    value: player.asset.assetName,
                };
            }),
        };
        components.push(new discord_js_1.MessageActionRow().addComponents(new discord_js_1.MessageButton()
            .setCustomId('select-attacker')
            .setLabel('Choose your AOWL')
            .setStyle('PRIMARY')));
    }
    if (type === embeds_1.default.activeGame) {
        const fields = (options === null || options === void 0 ? void 0 : options.hasOwnProperty('fields'))
            ? options.fields
            : (0, helpers_1.mapPlayersForEmbed)(playerArr, 'game');
        data = {
            title: '🔥 Ye Among AOWLs 🔥',
            description: '💀 Who will survive? 💀',
            color: 'RANDOM',
            thumbNail: 'https://www.randgallery.com/wp-content/uploads/2021/11/owl.jpg',
            fields,
            footer: {
                text: 'A HootGang Production',
            },
        };
        const victims = playerArr
            .filter((player) => !player.timedOut && !player.dead)
            .map((player) => ({
            label: `Attack ${player.username}`,
            description: '',
            value: player.discordId,
        }));
        components.push(new discord_js_1.MessageActionRow().addComponents(new discord_js_1.MessageButton()
            .setCustomId('attack')
            .setLabel('Attack!')
            .setStyle('DANGER'), new discord_js_1.MessageButton()
            .setCustomId('random-attack')
            .setLabel('Blindly attack!')
            .setStyle('DANGER')), new discord_js_1.MessageActionRow().addComponents(new discord_js_1.MessageSelectMenu()
            .setCustomId('select-victim')
            .setPlaceholder('Select a victim to attack')
            .addOptions(victims)));
    }
    if (type === embeds_1.default.countDown) {
        data = {
            title: 'Ready your AOWLS!',
            description: `Game starting in ${options === null || options === void 0 ? void 0 : options.countDown}...`,
        };
    }
    if (type === embeds_1.default.timedOut) {
        data = {
            title: 'BOOOO!!!',
            description: 'Game has ended due to all players being removed for inactivity',
        };
    }
    if (options && type === embeds_1.default.win) {
        const { player, winByTimeout } = options;
        data = {
            title: 'WINNER!!!',
            description: `${player === null || player === void 0 ? void 0 : player.username}'s ${player === null || player === void 0 ? void 0 : player.asset.unitName} ${winByTimeout
                ? 'won by default - all other players timed out!'
                : `destroyed the competition`}`,
            color: 'DARK_AQUA',
            image: player === null || player === void 0 ? void 0 : player.asset.assetUrl,
        };
    }
    if (options && type === embeds_1.default.leaderBoard) {
        const { fields } = options;
        data = {
            title: 'Leaderboard',
            description: 'Which AOWLs rule them all?',
            fields,
        };
    }
    let { title, description, color, image, thumbNail, fields, footer } = Object.assign(Object.assign({}, defaultEmbedValues), data);
    const embed = new discord_js_1.MessageEmbed();
    if ((image === null || image === void 0 ? void 0 : image.slice(0, 4)) === 'ipfs') {
        const ifpsHash = image.slice(7);
        image = `${ipfsGateway}${ifpsHash}`;
    }
    title && embed.setTitle(title);
    description && embed.setDescription(description);
    color && embed.setColor(color);
    image && embed.setImage(image);
    thumbNail && embed.setThumbnail(thumbNail);
    (fields === null || fields === void 0 ? void 0 : fields.length) && embed.addFields(fields);
    footer && embed.setFooter(footer);
    return {
        embeds: [embed],
        fetchReply: true,
        components,
    };
}
exports.default = doEmbed;
