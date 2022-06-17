"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Game {
    constructor(players, active, win, coolDown, embed, attackEngaged, waitingRoom) {
        this.players = players;
        this.active = active;
        this.win = win;
        this.coolDown = coolDown;
        this.embed = embed;
        this.attackEngaged = attackEngaged;
        this.waitingRoom = waitingRoom;
        this.players = players;
        this.active = false;
        this.win = false;
        this.coolDown = coolDown;
        this.embed = embed;
        this.attackEngaged = false;
        this.waitingRoom = false;
    }
}
exports.default = Game;
