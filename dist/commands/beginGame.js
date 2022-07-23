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
// Globals
const __1 = require("..");
const settings_1 = __importDefault(require("../settings"));
module.exports = {
    data: new builders_1.SlashCommandBuilder()
        .setName('begin-game')
        .setDescription('begin the game'),
    execute(interaction) {
        return __awaiter(this, void 0, void 0, function* () {
            const { user } = interaction;
            const { minCapacity } = settings_1.default;
            const playerArr = Object.values(__1.game.players);
            if (!__1.game.waitingRoom) {
                return interaction.reply({
                    content: 'Game is not currently active. use the /start command to start the game',
                    ephemeral: true,
                });
            }
            if (playerArr.length >= minCapacity) {
                __1.game.waitingRoom = false;
                interaction.reply({
                    content: `${user.username} has started the game`,
                });
                setTimeout(() => {
                    interaction.deleteReply();
                }, 5000);
            }
            else {
                interaction.reply({
                    content: `You can't start with less than ${minCapacity} players`,
                    ephemeral: true,
                });
            }
        });
    },
};
