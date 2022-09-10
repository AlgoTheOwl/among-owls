"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class User {
    constructor(username, discordId, address, assets, hoot, holdingsRefreshDate, // timestamp
    _id, yaoWins, yaoLosses, yaoKos, coolDowns, // timestamp
    selectedAssetId) {
        this.username = username;
        this.discordId = discordId;
        this.address = address;
        this.assets = assets;
        this.hoot = hoot;
        this.holdingsRefreshDate = holdingsRefreshDate;
        this._id = _id;
        this.yaoWins = yaoWins;
        this.yaoLosses = yaoLosses;
        this.yaoKos = yaoKos;
        this.coolDowns = coolDowns;
        this.selectedAssetId = selectedAssetId;
        this.yaoWins = 0;
        this.coolDowns = {};
    }
}
exports.default = User;
