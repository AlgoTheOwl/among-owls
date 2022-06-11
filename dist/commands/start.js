"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const helpers_1 = require("../utils/helpers");
const embeds_1 = __importDefault(require("../embeds"));
const helpers_2 = require("../utils/helpers");
const player_1 = __importDefault(require("../models/player"));
const database_service_1 = require("../database/database.service");
const builders_1 = require("@discordjs/builders");
const helpers_3 = require("../utils/helpers");
const __1 = require("..");
const settings_1 = __importDefault(require("../settings"));
const { hp } = settings_1.default;
const roleId = process.env.ADMIN_ID;
const imageDir = 'dist/nftAssets';
module.exports = {
    data: new builders_1.SlashCommandBuilder()
        .setName('start')
        .setDescription('start When AOWLS Attack'),
    async execute(interaction) {
        if (!interaction.isCommand())
            return;
        const { user } = interaction;
        const hasRole = await (0, helpers_3.confirmRole)(roleId, interaction, user.id);
        if (!hasRole) {
            return await interaction.reply({
                content: 'Only administrators can use this command',
                ephemeral: true,
            });
        }
        if (__1.game === null || __1.game === void 0 ? void 0 : __1.game.active) {
            return await interaction.reply({
                content: 'A game is already running',
                ephemeral: true,
            });
        }
        const players = (await database_service_1.collections.yaoPlayers
            .find({})
            .toArray());
        if (players.length < 2) {
            return await interaction.reply({
                content: 'There are not enough players to start the game',
                ephemeral: true,
            });
        }
        await interaction.deferReply();
        const gamePlayers = {};
        // empty image directory
        (0, helpers_1.emptyDir)(imageDir);
        await (0, helpers_1.asyncForEach)(players, async (player) => {
            const { username, discordId, address, asset, userId } = player;
            // save each image locally for use later
            const localPath = await (0, helpers_1.downloadFile)(asset, imageDir, username);
            if (localPath) {
                const assetWithLocalPath = Object.assign(Object.assign({}, asset), { localPath });
                gamePlayers[discordId] = new player_1.default(username, discordId, address, assetWithLocalPath, userId, hp, 0);
            }
            else {
                // error downloading
                await interaction.followUp({
                    content: 'Error downloading assets from the blockchain, please try again',
                    ephemeral: true,
                });
            }
        });
        const playerArr = Object.values(gamePlayers);
        // send back game embed
        const embedData = {
            image: undefined,
            fields: (0, helpers_2.mapPlayersForEmbed)(playerArr),
            description: 'Leaderboard',
            isMain: true,
        };
        const file = new discord_js_1.MessageAttachment('src/images/main.gif');
        // send embed here
        await interaction.editReply({ files: [file] });
        // start game
        __1.game.players = gamePlayers;
        __1.game.active = true;
        __1.game.embed = await interaction.followUp((0, embeds_1.default)(embedData));
    },
};
// export default async function startGame(interaction: Interaction) {
//   try {
//     if (!interaction.isCommand()) return
//     if (previousGame?.active) {
//       return await interaction.reply({
//         content: 'A game is already running',
//         ephemeral: true,
//       })
//     }
//     const players = (await collections.yaoPlayers
//       .find({})
//       .toArray()) as WithId<Player>[]
//     if (players.length < 2) {
//       return await interaction.reply({
//         content: 'There are not enough players to start the game',
//         ephemeral: true,
//       })
//     }
//     await interaction.deferReply()
//     const gamePlayers: { [key: string]: Player } = {}
//     // empty image directory
//     emptyDir(imageDir)
//     await asyncForEach(players, async (player: Player) => {
//       const { username, discordId, address, asset, userId } = player
//       // save each image locally for use later
//       const localPath = await downloadFile(asset, imageDir, username)
//       if (localPath) {
//         const assetWithLocalPath: Asset = { ...asset, localPath }
//         gamePlayers[discordId] = new Player(
//           username,
//           discordId,
//           address,
//           assetWithLocalPath,
//           userId,
//           hp,
//           0
//         )
//       } else {
//         // error downloading
//         await interaction.followUp({
//           content:
//             'Error downloading assets from the blockchain, please try again',
//           ephemeral: true,
//         })
//       }
//     })
//     const playerArr = Object.values(gamePlayers)
//     // instansiate new game
//     game = new Game(gamePlayers, true, false, 1000)
//     // send back game embed
//     const embedData: EmbedData = {
//       image: undefined,
//       fields: mapPlayersForEmbed(playerArr),
//       description: 'Leaderboard',
//       players: playerArr,
//     }
//     const file = new MessageAttachment('src/images/main.gif')
//     // send embed here
//     await interaction.editReply({ files: [file] })
//     game.embed = await interaction.followUp(doEmbed(embedData))
//   } catch (error) {
//     console.log(error)
//     //@ts-ignore
//     interaction.followUp({
//       content:
//         'Error starting game - sometimes requests time out here - try starting the game again',
//       ephemeral: true,
//     })
//   }
// }
