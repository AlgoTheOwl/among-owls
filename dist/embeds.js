"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultEmbedValues = void 0;
const discord_js_1 = require("discord.js");
const ipfsGateway = process.env.IPFS_GATEWAY;
exports.defaultEmbedValues = {
    title: '🔥🦉🔥 When AOWLS Attack 🔥🦉🔥',
    description: '💀 Who will survive? 💀',
    color: 'DARK_AQUA',
    image: 'https://external-content.duckduckgo.com/iu/?u=http%3A%2F%2Fweirdlystrange.com%2Fwp-content%2Fuploads%2F2015%2F12%2Fowl004.jpg&f=1&nofb=1',
    thumbNail: 'https://www.randgallery.com/wp-content/uploads/2021/11/owl.jpg',
    footer: {
        text: 'test footer content',
        iconUrl: 'https://www.randgallery.com/wp-content/uploads/2021/11/owl.jpg',
    },
};
function doEmbed(data) {
    let { title, description, color, image, thumbNail, fields, footer } = data;
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
    };
}
exports.default = doEmbed;
