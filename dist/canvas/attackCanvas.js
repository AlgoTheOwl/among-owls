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
Object.defineProperty(exports, "__esModule", { value: true });
const canvas_1 = require("canvas");
const promises_1 = require("fs/promises");
const owlReplies = ['HOOOOOOT!!!', 'SCREEETCH!!!'];
function doAttackCanvas(damage, asset, victimUsername, attackerUsername) {
    return __awaiter(this, void 0, void 0, function* () {
        const { localPath } = asset;
        (0, canvas_1.registerFont)('src/canvas/fonts/permenent-marker.ttf', {
            family: 'permanent-marker',
        });
        const canvas = (0, canvas_1.createCanvas)(300, 300);
        if (localPath) {
            const ctx = canvas.getContext('2d');
            // download Image
            const nftImage = yield (0, promises_1.readFile)(localPath);
            const canvasImg = new canvas_1.Image();
            canvasImg.src = nftImage;
            // draw Image
            ctx.drawImage(canvasImg, 0, 0, canvas.width, canvas.height);
            // add text
            ctx.font = '45px permanent-marker';
            // Select the style that will be used to fill the text in
            ctx.fillStyle = 'red';
            const randomNumber = Math.floor(Math.random() * 2);
            const text = owlReplies[randomNumber === 1 ? 0 : 1];
            // Actually fill the text with a solid color
            ctx.fillText(text, 5, 50);
        }
        return canvas;
    });
}
exports.default = doAttackCanvas;
