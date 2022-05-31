"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Asset {
    constructor(userId, assetId, assetName, assetUrl, unitName, localPath) {
        this.userId = userId;
        this.assetId = assetId;
        this.assetName = assetName;
        this.assetUrl = assetUrl;
        this.unitName = unitName;
        this.localPath = localPath;
    }
}
exports.default = Asset;
