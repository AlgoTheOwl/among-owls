"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const _1 = require(".");
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
    isMain: true,
};
function doEmbed(data) {
    let { title, description, color, image, thumbNail, fields, footer, isMain, isWaitingRoom, } = Object.assign(Object.assign({}, defaultEmbedValues), data);
    let components = [];
    if (isWaitingRoom && !_1.game.active) {
        components.push(new discord_js_1.MessageActionRow().addComponents(new discord_js_1.MessageButton()
            .setCustomId('select-attacker')
            .setLabel('Choose your AOWL')
            .setStyle('PRIMARY')));
    }
    // If it's the main embed, add all the good stuff
    if (!isWaitingRoom && isMain && _1.game.active) {
        const playerArr = Object.values(_1.game.players);
        const victims = playerArr
            .filter((player) => !player.timedOut && !player.dead)
            .map((player) => ({
            label: `Attack ${player.username}`,
            description: '',
            value: player.discordId,
        }));
        const attackSelectMenuOptions = (0, helpers_1.randomSort)(victims);
        components.push(new discord_js_1.MessageActionRow().addComponents(new discord_js_1.MessageButton()
            .setCustomId('attack')
            .setLabel('Attack!')
            .setStyle('DANGER'), new discord_js_1.MessageButton()
            .setCustomId('random-attack')
            .setLabel('Blindly attack!')
            .setStyle('DANGER')), new discord_js_1.MessageActionRow().addComponents(new discord_js_1.MessageSelectMenu()
            .setCustomId('select-victim')
            .setPlaceholder('Select a victim to attack')
            .addOptions(attackSelectMenuOptions)));
    }
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
