"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const startWaitingRoom_1 = __importDefault(require("./startWaitingRoom"));
const settings_1 = __importDefault(require("../settings"));
const { channelId } = settings_1.default;
async function begin() {
    (0, startWaitingRoom_1.default)();
}
exports.default = begin;
