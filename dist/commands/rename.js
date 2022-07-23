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
// Globals
const __1 = require("..");
module.exports = {
    data: new builders_1.SlashCommandBuilder()
        .setName('rename')
        .setDescription('Rename your AOWL')
        .addStringOption((option) => option
        .setName('name')
        .setDescription('enter a new name for your AOWL')
        .setRequired(true)),
    enabled: true,
    execute(interaction) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!interaction.isCommand())
                return;
            const { user } = interaction;
            const name = interaction.options.getString('name');
            __1.game.players[user.id].asset.assetName = name;
            interaction.reply({
                content: `Your AOWL is now named ${name}`,
                ephemeral: true,
            });
        });
    },
};
