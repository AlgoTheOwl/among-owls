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
//Data
const database_service_1 = require("../database/database.service");
const embeds_1 = __importDefault(require("../constants/embeds"));
// Embeds
const embeds_2 = __importDefault(require("../embeds"));
module.exports = {
    data: new builders_1.SlashCommandBuilder()
        .setName('asset-profile')
        .setDescription('view an asset profile'),
    enabled: true,
    execute(interaction) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!interaction.isSelectMenu())
                return;
            yield interaction.deferReply();
            const { values, user } = interaction;
            const assetId = Number(values[0]);
            const discordId = user.id;
            const { assets } = (yield database_service_1.collections.users.findOne({
                discordId,
            }));
            const asset = assets[assetId];
            if (asset) {
                const { assetUrl, assetName, unitName, assetId, wins } = asset;
                const winNumber = wins ? wins : 0;
                const fields = [
                    { name: 'Unit name', value: unitName },
                    { name: 'Asset ID', value: assetId.toString() },
                    { name: 'Wins', value: winNumber.toString() },
                ];
                yield interaction.editReply((0, embeds_2.default)(embeds_1.default.assetProfile, {
                    assetUrl,
                    fields,
                    assetName,
                }));
            }
        });
    },
};
