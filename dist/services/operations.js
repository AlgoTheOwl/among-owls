"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchPlayers = exports.findPlayer = exports.deletePlayer = exports.addPlayer = void 0;
const database_service_1 = require("./database.service");
const addPlayer = (playerData) => __awaiter(void 0, void 0, void 0, function* () {
    const collection = database_service_1.db.collection('users');
    return yield collection.insertOne(playerData);
});
exports.addPlayer = addPlayer;
const deletePlayer = (playerData) => __awaiter(void 0, void 0, void 0, function* () {
    const collection = database_service_1.db.collection('users');
    return yield collection.deleteOne(playerData);
});
exports.deletePlayer = deletePlayer;
const findPlayer = (discordId) => __awaiter(void 0, void 0, void 0, function* () {
    const collection = database_service_1.db.collection('users');
    return yield collection.findOne({ discordId });
});
exports.findPlayer = findPlayer;
const fetchPlayers = () => __awaiter(void 0, void 0, void 0, function* () {
    const collection = database_service_1.db.collection('users');
    return yield collection.find().toArray();
});
exports.fetchPlayers = fetchPlayers;
