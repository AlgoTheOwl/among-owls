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
