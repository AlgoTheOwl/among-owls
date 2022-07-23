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
// Helpers
const helpers_1 = require("../utils/helpers");
// Globals
const __1 = require("..");
const roleId = process.env.ADMIN_ID;
module.exports = {
    data: new builders_1.SlashCommandBuilder()
        .setName('stop')
        .setDescription('Stop the current game'),
    enabled: true,
    execute(interaction) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!interaction.isCommand())
                return;
            const { user } = interaction;
            const hasRole = yield (0, helpers_1.confirmRole)(roleId, interaction, user.id);
            if (!hasRole) {
                return yield interaction.reply({
                    content: 'Only administrators can use this command',
                    ephemeral: true,
                });
            }
            if (!(__1.game === null || __1.game === void 0 ? void 0 : __1.game.active) && !__1.game.waitingRoom)
                return interaction.reply({
                    content: 'Game is not currently running',
                    ephemeral: true,
                });
            (0, helpers_1.resetGame)(true);
            return interaction.reply({ content: 'Game stopped', ephemeral: true });
        });
    },
};
