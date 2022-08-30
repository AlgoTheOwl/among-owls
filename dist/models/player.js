"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Player {
    constructor(username, discordId, address, asset, userId, hp, assetMultiplier, coolDownTimeLeft, rolledRecently, timedOut, dead, victimId, win) {
        this.username = username;
        this.discordId = discordId;
        this.address = address;
        this.asset = asset;
        this.userId = userId;
        this.hp = hp;
        this.assetMultiplier = assetMultiplier;
        this.coolDownTimeLeft = coolDownTimeLeft;
        this.rolledRecently = rolledRecently;
        this.timedOut = timedOut;
        this.dead = dead;
        this.victimId = victimId;
        this.win = win;
        this.rolledRecently = false;
        this.timedOut = false;
        this.coolDownTimeLeft = 0;
        this.dead = false;
        this.win = false;
    }
}
exports.default = Player;
