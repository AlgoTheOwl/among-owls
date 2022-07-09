"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class User {
    constructor(username, discordId, address, assets, // assetId
    hoot, _id, yaoWins, coolDowns // timestamp
    ) {
        this.username = username;
        this.discordId = discordId;
        this.address = address;
        this.assets = assets;
        this.hoot = hoot;
        this._id = _id;
        this.yaoWins = yaoWins;
        this.coolDowns = coolDowns;
        this.yaoWins = 0;
        this.coolDowns = {};
    }
}
exports.default = User;
