"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const _1 = require(".");
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
    let { title, description, color, image, thumbNail, fields, footer, isMain } = Object.assign(Object.assign({}, defaultEmbedValues), data);
    let components = [];
    if (isMain && _1.game.active) {
        const playerArr = Object.values(_1.game.players);
        const attackSelectMenuOptions = playerArr
            .filter((player) => !player.timedOut || !player.dead)
            .map((player) => ({
            label: `Attack ${player.username}`,
            description: '',
            value: player.discordId,
        }));
        components.push(new discord_js_1.MessageActionRow().addComponents(new discord_js_1.MessageSelectMenu()
            .setCustomId('attack')
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
    fields && embed.addFields(fields);
    footer && embed.setFooter(footer);
    return {
        embeds: [embed],
        fetchReply: true,
        components,
    };
}
exports.default = doEmbed;
