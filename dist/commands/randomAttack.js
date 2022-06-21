"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const builders_1 = require("@discordjs/builders");
const attack_1 = require("../commandUtils/attack");
module.exports = {
    data: new builders_1.SlashCommandBuilder()
        .setName('random-attack')
        .setDescription('Attack another user!'),
    async execute(interaction) {
        if (!interaction.isButton())
            return;
        (0, attack_1.attack)(interaction, true);
    },
};
