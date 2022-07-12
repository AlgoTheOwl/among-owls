"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Asset {
    constructor(assetId, assetName, assetUrl, unitName, userId, localPath, wins, alias) {
        this.assetId = assetId;
        this.assetName = assetName;
        this.assetUrl = assetUrl;
        this.unitName = unitName;
        this.userId = userId;
        this.localPath = localPath;
        this.wins = wins;
        this.alias = alias;
    }
}
exports.default = Asset;
