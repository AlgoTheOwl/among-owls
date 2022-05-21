"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const user_1 = __importDefault(require("../models/user"));
exports.default = [
    new user_1.default('user1', 'testid', 'testAddress', { assetId: 123456 }, 1000),
    new user_1.default('user2', 'testid', 'testAddress', { assetId: 123456 }, 1000),
    new user_1.default('user3', 'testid', 'testAddress', { assetId: 123456 }, 1000),
    new user_1.default('user4', 'testid', 'testAddress', { assetId: 123456 }, 1000),
    new user_1.default('user5', 'testid', 'testAddress', { assetId: 123456 }, 1000),
];
const instertedPlayer = {
    discordId: '717166398320672867',
    username: 'Algorandpa',
    address: '5PH4EVRJVWF3M6JRPQEA2HRXTSNH6NNGBNHBNFO7XD7JUVZRHC5CDMS47A',
    asset: {
        assetUrl: 'ipfs://bafybeib6ulqljdqwki2dwhyjkkologteg5q4ecoaydzt2h6wl5ztm5wmvq',
        assetName: 'Wolf #98',
        assetId: 550344747,
        unitName: 'WOLF-98',
    },
};
