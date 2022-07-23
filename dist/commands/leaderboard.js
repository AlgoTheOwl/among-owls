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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// Discord
const builders_1 = require("@discordjs/builders");
// Data
const database_service_1 = require("../database/database.service");
const embeds_1 = __importDefault(require("../constants/embeds"));
// Helpers
const embeds_2 = __importDefault(require("../embeds"));
module.exports = {
    data: new builders_1.SlashCommandBuilder()
        .setName('leaderboard')
        .setDescription('show global leaderboard for AOWL games'),
    enabled: true,
    execute(interaction) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!interaction.isCommand())
                return;
            const winningUsers = (yield database_service_1.collections.users
                .find({ yaoWins: { $gt: 0 } })
                .limit(10)
                .sort({ yaoWins: 'desc' })
                .toArray());
            const fields = winningUsers.map((user, i) => {
                const place = i + 1;
                const win = user.yaoWins === 1 ? 'win' : 'wins';
                return {
                    name: `#${place}: ${user.username}`,
                    value: `${user.yaoWins} ${win}`,
                };
            });
            if (fields === null || fields === void 0 ? void 0 : fields.length) {
                yield interaction.reply((0, embeds_2.default)(embeds_1.default.leaderBoard, { fields }));
            }
            else {
                yield interaction.reply({ content: 'no winners yet!', ephemeral: true });
            }
        });
    },
};
