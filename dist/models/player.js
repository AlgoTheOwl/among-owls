"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Player {
    constructor(username, discordId, address, asset, userId, hp, coolDownTimeLeft, rolledRecently, timedOut, dead) {
        this.username = username;
        this.discordId = discordId;
        this.address = address;
        this.asset = asset;
        this.userId = userId;
        this.hp = hp;
        this.coolDownTimeLeft = coolDownTimeLeft;
        this.rolledRecently = rolledRecently;
        this.timedOut = timedOut;
        this.dead = dead;
        this.rolledRecently = false;
        this.timedOut = false;
        this.coolDownTimeLeft = 0;
        this.dead = false;
    }
}
exports.default = Player;
