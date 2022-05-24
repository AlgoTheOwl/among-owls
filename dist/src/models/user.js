"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class User {
    constructor(username, discordId, address, asset, hp, coolDownTimeLeft, id) {
        this.username = username;
        this.discordId = discordId;
        this.address = address;
        this.asset = asset;
        this.hp = hp;
        this.coolDownTimeLeft = coolDownTimeLeft;
        this.id = id;
    }
}
exports.default = User;
