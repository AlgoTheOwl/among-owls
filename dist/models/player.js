"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Player {
    constructor(username, discordId, address, asset, userId, hp, victimId // public win?: boolean
    ) {
        this.username = username;
        this.discordId = discordId;
        this.address = address;
        this.asset = asset;
        this.userId = userId;
        this.hp = hp;
        this.victimId = victimId;
        this.coolDownTimeLeft = 0;
        this.dead = false;
        this.win = false;
        this.kos = 0;
    }
}
exports.default = Player;
