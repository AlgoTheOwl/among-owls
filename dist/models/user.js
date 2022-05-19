"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class User {
    constructor(username, discordId, address, asset, hp, id) {
        this.username = username;
        this.discordId = discordId;
        this.address = address;
        this.asset = asset;
        this.hp = hp;
        this.id = id;
    }
}
exports.default = User;
