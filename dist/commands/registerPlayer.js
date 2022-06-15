"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const builders_1 = require("@discordjs/builders");
const index_1 = require("../index");
// add player object to db here
module.exports = {
    data: new builders_1.SlashCommandBuilder()
        .setName('register-player')
        .setDescription('Register an active player'),
    async execute(interaction) {
        if (!interaction.isSelectMenu() || !(index_1.game === null || index_1.game === void 0 ? void 0 : index_1.game.active))
            return;
    },
};
