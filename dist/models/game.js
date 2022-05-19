"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Game {
    constructor(players, active, win, coolDown, embed) {
        this.players = players;
        this.active = active;
        this.win = win;
        this.coolDown = coolDown;
        this.embed = embed;
        this.players = players;
        this.active = true;
        this.win = false;
        this.coolDown = coolDown;
        this.embed = embed;
    }
}
exports.default = Game;
