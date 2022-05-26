"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const canvas_1 = require("canvas");
const promises_1 = require("fs/promises");
const owlReplies = [
    'HOOOOOOT!!!',
    'SCREEETCH!!!',
    'RAAWWWRRR!!!',
    'CHIIIIRP!!!',
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
        const randomNumber = Math.floor(Math.random() * owlReplies.length);
        const text = owlReplies[randomNumber === 1 ? 0 : 1];
        // Actually fill the text with a solid color
        ctx.fillText(text, 5, 50);
    }
    return canvas;
}
exports.default = doAttackCanvas;
