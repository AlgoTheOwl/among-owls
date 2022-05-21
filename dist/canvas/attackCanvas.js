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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const canvas_1 = __importDefault(require("canvas"));
const promises_1 = require("fs/promises");
const canvas = canvas_1.default.createCanvas(0, 0);
const ctx = canvas.getContext('2d');
function doAttackCanvas(damage, asset, victimUsername, attackerUsername) {
    return __awaiter(this, void 0, void 0, function* () {
        const { localPath } = asset;
        if (localPath) {
            // download Image
            const nftImage = yield (0, promises_1.readFile)(localPath);
            const canvasImg = new canvas_1.default.Image();
            canvasImg.src = nftImage;
            // size image
            canvas.width = 300;
            canvas.height = 300;
            // canvas.width = canvasImg.width
            // canvas.height = canvasImg.height
            // draw Image
            ctx.drawImage(canvasImg, 0, 0, canvas.width, canvas.height);
            // add text
            ctx.font = '15px sans-serif';
            // Select the style that will be used to fill the text in
            ctx.fillStyle = 'black';
            // Actually fill the text with a solid color
            ctx.fillText(`${victimUsername} takes ${damage} damage`, 75, 30);
        }
        // return
        return canvas;
    });
}
exports.default = doAttackCanvas;
