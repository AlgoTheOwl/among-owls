"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class User {
    constructor(username, discordId, address, asset, id) {
        this.username = username;
        this.discordId = discordId;
        this.address = address;
        this.asset = asset;
        this.id = id;
    }
}
exports.default = User;
