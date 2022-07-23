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
// Discord
const builders_1 = require("@discordjs/builders");
// Data
const database_service_1 = require("../database/database.service");
// Helpers
const helpers_1 = require("../utils/helpers");
const roleId = process.env.ADMIN_ID;
module.exports = {
    data: new builders_1.SlashCommandBuilder()
        .setName('clear-leaderboard')
        .setDescription('clear the leaderboard standings'),
    execute(interaction) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!interaction.isCommand())
                return;
            const { user: { id }, } = interaction;
            const hasRole = yield (0, helpers_1.confirmRole)(roleId, interaction, id);
            if (!hasRole) {
                return interaction.reply({
                    content: 'You do not have the required role to use this command',
                    ephemeral: true,
                });
            }
            yield interaction.deferReply({ ephemeral: true });
            try {
                yield database_service_1.collections.users.updateMany({}, { $set: { yaoWins: 0 } });
            }
            catch (error) {
                console.log(error);
            }
            return interaction.editReply({
                content: 'Leaderboard cleared',
            });
        });
    },
};
