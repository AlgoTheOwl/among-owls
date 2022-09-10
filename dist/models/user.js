"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class User {
    constructor(username, discordId, address, assets, hoot, holdingsRefreshDate, // timestamp
    _id) {
        this.username = username;
        this.discordId = discordId;
        this.address = address;
        this.assets = assets;
        this.hoot = hoot;
        this.holdingsRefreshDate = holdingsRefreshDate;
        this._id = _id;
        this.yaoWins = 0;
        this.yaoLosses = 0;
        this.yaoKos = 0;
        this.coolDowns = {};
    }
}
exports.default = User;
