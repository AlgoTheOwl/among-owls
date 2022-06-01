"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeAllPlayers = exports.fetchPlayers = exports.findPlayer = exports.deletePlayer = exports.addPlayer = void 0;
const database_service_1 = require("./database.service");
const addPlayer = async (playerData) => {
    const collection = database_service_1.db.collection('users');
    return await collection.insertOne(playerData);
};
exports.addPlayer = addPlayer;
const deletePlayer = async (playerData) => {
    const collection = database_service_1.db.collection('users');
    return await collection.deleteOne(playerData);
};
exports.deletePlayer = deletePlayer;
const findPlayer = async (discordId) => {
    const collection = database_service_1.db.collection('users');
    return await collection.findOne({ discordId });
};
exports.findPlayer = findPlayer;
const fetchPlayers = async () => {
    const collection = database_service_1.db.collection('users');
    return await collection.find().toArray();
};
exports.fetchPlayers = fetchPlayers;
const removeAllPlayers = async () => {
    const collection = database_service_1.db.collection('players');
    return await collection.deleteMany({});
};
exports.removeAllPlayers = removeAllPlayers;
