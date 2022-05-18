"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
function doEmbed(data) {
    let { title, description, color, image, thumbNail, fields } = data;
    const embed = new discord_js_1.MessageEmbed();
    console.log('image before', image);
    if ((image === null || image === void 0 ? void 0 : image.slice(0, 4)) === 'ipfs') {
        const ifpsHash = image.slice(7);
        image = `https://dweb.link/ipfs/${ifpsHash}`;
    }
    console.log('image after', image);
    title && embed.setTitle(title);
    description && embed.setDescription(description);
    color && embed.setColor(color);
    image && embed.setImage(image);
    thumbNail && embed.setThumbnail(thumbNail);
    fields && embed.setFields(fields);
    return {
        embeds: [embed],
        fetchReply: true,
    };
}
exports.default = doEmbed;
