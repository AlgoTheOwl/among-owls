"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class User {
    constructor(username, discordId, address, assets, // assetId
    _id) {
        this.username = username;
        this.discordId = discordId;
        this.address = address;
        this.assets = assets;
        this._id = _id;
    }
}
exports.default = User;
