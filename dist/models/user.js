"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class User {
    constructor(username, discordId, address, assets, // assetId
    _id, yaoWins, coolDownDone // timestamp
    ) {
        this.username = username;
        this.discordId = discordId;
        this.address = address;
        this.assets = assets;
        this._id = _id;
        this.yaoWins = yaoWins;
        this.coolDownDone = coolDownDone;
        this.yaoWins = 0;
    }
}
exports.default = User;
