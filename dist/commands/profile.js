"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const builders_1 = require("@discordjs/builders");
const discord_js_1 = require("discord.js");
const database_service_1 = require("../database/database.service");
const settings_1 = __importDefault(require("../settings"));
const embeds_1 = __importDefault(require("../constants/embeds"));
const embeds_2 = __importDefault(require("../embeds"));
module.exports = {
    data: new builders_1.SlashCommandBuilder()
        .setName('profile')
        .setDescription('view your profile'),
    enabled: true,
    async execute(interaction) {
        var _a;
        if (!interaction.isCommand())
            return;
        const { maxAssets } = settings_1.default;
        const { user } = interaction;
        await interaction.deferReply();
        const _b = (await database_service_1.collections.users.findOne({
            discordId: user.id,
        })), { assets = {} } = _b, userData = __rest(_b, ["assets"]);
        const selectMenu = new discord_js_1.MessageSelectMenu()
            .setCustomId('asset-profile')
            .setPlaceholder('See your AOWL stats');
        const options = Object.values(assets)
            .map((asset, i) => {
            var _a;
            if (i < maxAssets) {
                return {
                    label: asset.assetName,
                    description: 'Select and AOWL to view',
                    value: (_a = asset === null || asset === void 0 ? void 0 : asset.assetId) === null || _a === void 0 ? void 0 : _a.toString(),
                };
            }
        })
            .filter(Boolean);
        if (options.length) {
            selectMenu.addOptions(options);
        }
        const fields = [];
        let thumbNail;
        // picture of first asset
        const firstAsset = (_a = assets[0]) === null || _a === void 0 ? void 0 : _a.assetUrl;
        if (firstAsset) {
            thumbNail = firstAsset;
        }
        const hoot = userData.hoot ? userData.hoot.toString() : '0';
        const yaoWins = userData.yaoWins ? userData.yaoWins.toString() : '0';
        // discord username
        fields.push({ name: 'Username', value: user.username }, { name: 'Hoot owned', value: hoot }, { name: 'Games won', value: yaoWins });
        const row = new discord_js_1.MessageActionRow().addComponents(selectMenu);
        const embed = (0, embeds_2.default)(embeds_1.default.profile, { thumbNail, fields });
        await interaction.editReply({
            content: 'Choose your AOWL',
            components: [row],
            embeds: [embed],
        });
    },
};
