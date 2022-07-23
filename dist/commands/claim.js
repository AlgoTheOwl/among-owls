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
// Discrod
const builders_1 = require("@discordjs/builders");
// Data
const database_service_1 = require("../database/database.service");
// Helpers
const algorand_1 = require("../utils/algorand");
module.exports = {
    data: new builders_1.SlashCommandBuilder()
        .setName('claim')
        .setDescription('claim your hoot!'),
    enabled: true,
    execute(interaction) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!interaction.isCommand())
                return;
            try {
                const { user } = interaction;
                yield interaction.deferReply({ ephemeral: true });
                const userData = (yield database_service_1.collections.users.findOne({
                    discordId: user.id,
                }));
                if (!userData) {
                    return interaction.editReply({
                        content: 'You are not in the database',
                    });
                }
                const { hoot, address } = userData;
                if (!hoot) {
                    return interaction.editReply({
                        content: 'You have no hoot to claim',
                    });
                }
                yield database_service_1.collections.users.findOneAndUpdate({ discordId: user.id }, { $set: { hoot: 0 } });
                const status = yield (0, algorand_1.claimHoot)(hoot, address);
                if (status) {
                    return interaction.editReply(`Congrats, you've just received ${hoot} HOOT!`);
                }
            }
            catch (error) {
                return interaction.editReply('Something went wrong with your claim :( - please try again');
            }
        });
    },
};
