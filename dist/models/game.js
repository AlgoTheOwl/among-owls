"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// TODO: Add getters and setters, use proper OOP practices for game
class Game {
    constructor(players, active, win, coolDown, rounds, startTime, embed, attackEngaged, waitingRoom, stopped, megatron, arena, update) {
        this.players = players;
        this.active = active;
        this.win = win;
        this.coolDown = coolDown;
        this.rounds = rounds;
        this.startTime = startTime;
        this.embed = embed;
        this.attackEngaged = attackEngaged;
        this.waitingRoom = waitingRoom;
        this.stopped = stopped;
        this.megatron = megatron;
        this.arena = arena;
        this.update = update;
        this.players = players;
        this.active = false;
        this.win = false;
        this.coolDown = coolDown;
        this.embed = embed;
        this.megatron = megatron;
        this.attackEngaged = false;
        this.waitingRoom = false;
        this.arena = arena;
        this.stopped = false;
        this.update = false;
    }
}
exports.default = Game;
