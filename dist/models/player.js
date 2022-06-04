"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Player {
    constructor(username, discordId, address, asset, userId, hp, coolDownTimeLeft, rolledRecently) {
        this.username = username;
        this.discordId = discordId;
        this.address = address;
        this.asset = asset;
        this.userId = userId;
        this.hp = hp;
        this.coolDownTimeLeft = coolDownTimeLeft;
        this.rolledRecently = rolledRecently;
        this.rolledRecently = false;
    }
}
exports.default = Player;
