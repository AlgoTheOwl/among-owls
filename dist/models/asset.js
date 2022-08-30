"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Asset {
    constructor(assetId, assetName, assetUrl, unitName, wins, losses, userId, localPath, alias) {
        this.assetId = assetId;
        this.assetName = assetName;
        this.assetUrl = assetUrl;
        this.unitName = unitName;
        this.wins = wins;
        this.losses = losses;
        this.userId = userId;
        this.localPath = localPath;
        this.alias = alias;
    }
}
exports.default = Asset;
