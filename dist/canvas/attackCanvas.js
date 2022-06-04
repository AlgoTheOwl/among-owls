"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const canvas_1 = require("canvas");
const promises_1 = require("fs/promises");
const helpers_1 = require("../utils/helpers");
const owlReplies = [
    'HOOOOOOT!!!',
    'SCREEETCH!!!',
    'RAAWWRRR!!!',
    'CHIIIIIIRP!!!',
];
async function doAttackCanvas(damage, asset, victimUsername, attackerUsername) {
    const { localPath } = asset;
    (0, canvas_1.registerFont)('src/canvas/fonts/permenent-marker.ttf', {
        family: 'permanent-marker',
    });
    const canvas = (0, canvas_1.createCanvas)(300, 300);
    if (localPath) {
        const ctx = canvas.getContext('2d');
        // download Image
        const nftImage = await (0, promises_1.readFile)(localPath);
        const canvasImg = new canvas_1.Image();
        canvasImg.src = nftImage;
        // draw Image
        ctx.drawImage(canvasImg, 0, 0, canvas.width, canvas.height);
        // add text
        ctx.font = '45px permanent-marker';
        // Select the style that will be used to fill the text in
        ctx.fillStyle = 'red';
        const text = owlReplies[(0, helpers_1.randomNumber)(0, owlReplies.length)];
        // Actually fill the text with a solid color
        ctx.fillText(text, 5, 50);
    }
    return canvas;
}
exports.default = doAttackCanvas;
