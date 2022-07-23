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
module.exports = {
    data: new builders_1.SlashCommandBuilder()
        .setName('clear-timeout')
        .setDescription('clear all timeouts'),
    enabled: true,
    execute(interaction) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!interaction.isCommand())
                return;
            yield interaction.deferReply({ ephemeral: true });
            const isAdmin = yield (0, helpers_1.confirmRole)(process.env.ADMIN_ID, interaction, interaction.user.id);
            if (!isAdmin) {
                interaction.editReply('Only admins can use this command');
            }
            yield database_service_1.collections.users.updateMany({}, { $set: { coolDowns: {} } });
            return yield interaction.editReply('Timeouts cleared');
        });
    },
};
