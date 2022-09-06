"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Encounter {
    constructor(players, rounds, winnerId, winningAssetId, startTime, endTime, channelId) {
        this.players = players;
        this.rounds = rounds;
        this.winnerId = winnerId;
        this.winningAssetId = winningAssetId;
        this.startTime = startTime;
        this.endTime = endTime;
        this.channelId = channelId;
    }
}
exports.default = Encounter;
