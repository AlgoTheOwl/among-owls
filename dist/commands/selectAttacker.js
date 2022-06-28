"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const builders_1 = require("@discordjs/builders");
const database_service_1 = require("../database/database.service");
const __1 = require("..");
module.exports = {
    data: new builders_1.SlashCommandBuilder()
        .setName('select-attacker')
        .setDescription(`Pick which AOWL you'd like to compete`),
    async execute(interaction) {
        var _a;
        try {
            const { user: { id }, } = interaction;
            await interaction.deferReply({ ephemeral: true });
            const data = (await database_service_1.collections.users.findOne({
                discordId: id,
            }));
            if (data.coolDownDone && data.coolDownDone > Date.now()) {
                return interaction.editReply({
                    content: `Please wait ${Math.floor((data.coolDownDone - Date.now()) / 60000)} minutes before playing again`,
                });
            }
            if (!(data === null || data === void 0 ? void 0 : data.assets)) {
                return interaction.editReply({
                    content: 'You have no AOWLs to select!',
                });
            }
            if (!__1.game.waitingRoom) {
                return interaction.editReply({
                    content: 'Game is not currently active',
                });
            }
            if ((_a = data === null || data === void 0 ? void 0 : data.assets) === null || _a === void 0 ? void 0 : _a.length) {
                const options = data.assets.map((asset) => {
                    var _a;
                    return {
                        label: asset.assetName,
                        description: 'Select to play',
                        value: (_a = asset === null || asset === void 0 ? void 0 : asset.assetId) === null || _a === void 0 ? void 0 : _a.toString(),
                    };
                });
                const row = new discord_js_1.MessageActionRow().addComponents(new discord_js_1.MessageSelectMenu()
                    .setCustomId('register-player')
                    .setPlaceholder('Select an AOWL to attack')
                    .addOptions(options));
                await interaction.editReply({
                    content: 'Choose your AOWL',
                    components: [row],
                });
            }
        }
        catch (error) {
            console.log('ERROR SELECTING');
            console.log(error);
        }
    },
};
