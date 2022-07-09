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
    // thumbNail: 'https://www.randgallery.com/wp-content/uploads/2021/11/owl.jpg',
    footer: {
        text: 'A HootGang Production',
        iconUrl: 'https://www.randgallery.com/wp-content/uploads/2021/11/owl.jpg',
    },
    rawEmbed: false,
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
            .setStyle('PRIMARY'), new discord_js_1.MessageButton()
            .setCustomId('begin-game')
            .setLabel('Start game')
            .setStyle('SECONDARY')));
    }
    if (type === embeds_1.default.activeGame) {
        const fields = (options === null || options === void 0 ? void 0 : options.hasOwnProperty('fields'))
            ? options.fields
            : (0, helpers_1.mapPlayersForEmbed)(playerArr, 'game');
        data = {
            title: '🔥 Ye Among AOWLs 🔥',
            description: '💀 Who will survive? 💀',
            color: 'RANDOM',
            image: undefined,
            // thumbNail:
            //   'https://www.randgallery.com/wp-content/uploads/2021/11/owl.jpg',
            fields,
            footer: {
                text: 'A HootGang Production',
            },
        };
        // const victims = playerArr
        //   .filter((player: Player) => !player.timedOut && !player.dead)
        //   .map((player: Player) => ({
        //     label: `Attack ${player.username}`,
        //     description: '',
        //     value: player.discordId,
        //   }))
        // components.push(
        //   new MessageActionRow().addComponents(
        //     new MessageButton()
        //       .setCustomId('send-select')
        //       .setLabel('Select a victim to attack')
        //       .setStyle('DANGER')
        //   new MessageButton()
        //     .setCustomId('random-attack')
        //     .setLabel('Blindly attack!')
        //     .setStyle('DANGER')
        // ),
        // new MessageActionRow().addComponents(
        //   new MessageSelectMenu()
        //     .setCustomId('select-victim')
        //     .setPlaceholder('Select a victim to attack')
        //     .addOptions(victims)
        // )
        // )
    }
    if (type === embeds_1.default.countDown) {
        const imagePath = `src/images/${options === null || options === void 0 ? void 0 : options.countDown}.png`;
        const countDownImage = new discord_js_1.MessageAttachment(imagePath);
        data = {
            title: 'Ready your AOWLS!',
            description: `Game starting in ${options === null || options === void 0 ? void 0 : options.countDown}...`,
            files: [countDownImage],
            image: `attachment://${options === null || options === void 0 ? void 0 : options.countDown}.png`,
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
        const asserUrl = player.asset.assetUrl;
        const ipfs = (0, helpers_1.isIpfs)(player.asset.assetUrl);
        data = {
            title: 'WINNER!!!',
            description: `${player === null || player === void 0 ? void 0 : player.username}'s ${player === null || player === void 0 ? void 0 : player.asset.assetName} ${winByTimeout
                ? 'won by default - all other players timed out!'
                : `destroyed the competition`}`,
            color: 'DARK_AQUA',
            image: ipfs ? (0, helpers_1.normalizeIpfsUrl)(asserUrl) : player === null || player === void 0 ? void 0 : player.asset.assetUrl,
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
    if (type === embeds_1.default.stopped) {
        data = {
            title: 'Game stopped',
            description: 'Game has been stopped',
        };
    }
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
    let { title, description, color, image, thumbNail, fields, footer, files, rawEmbed, } = Object.assign(Object.assign({}, defaultEmbedValues), data);
    const embed = new discord_js_1.MessageEmbed();
    const ipfs = thumbNail ? (0, helpers_1.isIpfs)(thumbNail) : false;
    if (ipfs && thumbNail) {
        console.log('normalizing image');
        thumbNail = (0, helpers_1.normalizeIpfsUrl)(thumbNail);
    }
    title && embed.setTitle(title);
    description && embed.setDescription(description);
    color && embed.setColor(color);
    image && embed.setImage(image);
    thumbNail && embed.setThumbnail(thumbNail);
    (fields === null || fields === void 0 ? void 0 : fields.length) && embed.addFields(fields);
    footer && embed.setFooter(footer);
    if (rawEmbed) {
        return embed;
    }
    return {
        embeds: [embed],
        fetchReply: true,
        components,
        files: (files === null || files === void 0 ? void 0 : files.length) ? files : undefined,
    };
}
exports.default = doEmbed;
