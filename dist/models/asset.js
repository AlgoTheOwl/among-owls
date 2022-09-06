"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Asset {
    constructor(assetId, assetName, assetUrl, unitName, wins, losses, kos, userId, localPath, alias) {
        this.assetId = assetId;
        this.assetName = assetName;
        this.assetUrl = assetUrl;
        this.unitName = unitName;
        this.wins = wins;
        this.losses = losses;
        this.kos = kos;
        this.userId = userId;
        this.localPath = localPath;
        this.alias = alias;
    }
}
exports.default = Asset;
