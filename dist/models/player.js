"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Player {
    constructor(username, discordId, address, asset, hp, coolDownTimeLeft, _id) {
        this.username = username;
        this.discordId = discordId;
        this.address = address;
        this.asset = asset;
        this.hp = hp;
        this.coolDownTimeLeft = coolDownTimeLeft;
        this._id = _id;
    }
}
exports.default = Player;
