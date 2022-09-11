"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startWaitingRoom = void 0;
// Discord
const discord_js_1 = require("discord.js");
// Helpers
const helpers_1 = require("../utils/helpers");
const gameplay_1 = require("../utils/gameplay");
const embeds_1 = __importDefault(require("../embeds"));
const runGame_1 = __importDefault(require("./runGame"));
// Globals
const __1 = require("..");
// Schemas
const embeds_2 = __importDefault(require("../constants/embeds"));
const settings_1 = require("../utils/settings");
/**
 * Starts waiting room in specific channel
 * Watches for updates to game states and edits embed
 * Sends "megatron" image to channel before embed
 * @param channel {TextChannel}
 */
const startWaitingRoom = async (channel) => {
    const { id: channelId } = channel;
    const game = __1.games[channelId];
    const { maxCapacity } = await (0, settings_1.getSettings)(channelId);
    let capacity = maxCapacity;
    (0, gameplay_1.resetGame)(false, channelId);
    game.megatron = await channel.send((0, embeds_1.default)(embeds_2.default.waitingRoom, channelId));
    // Do waiting room
    game.waitingRoom = true;
    let playerCount = 0;
    const getPlayerCount = () => Object.values(game.players).length;
    while (playerCount < capacity && game.waitingRoom) {
        if (game.update) {
            await game.megatron.edit((0, embeds_1.default)(embeds_2.default.waitingRoom, channelId));
            playerCount = getPlayerCount();
        }
        await (0, helpers_1.wait)(1000);
    }
    if (game.waitingRoom)
        game.waitingRoom = false;
    await (0, helpers_1.wait)(2000);
    const file = new discord_js_1.AttachmentBuilder('src/images/main.gif');
    if (game.megatron) {
        await game.megatron.edit({
            files: [file],
            embeds: [],
            components: [],
            fetchReply: true,
        });
    }
    // start game
    game.active = true;
    game.arena = await channel.send((0, embeds_1.default)(embeds_2.default.activeGame, channelId));
    await sendVictimSelectMenu(game.players, channel);
    const randomlySortedPlayerArr = (0, helpers_1.randomSort)(Object.values(game.players));
    (0, runGame_1.default)(channel, randomlySortedPlayerArr);
};
exports.startWaitingRoom = startWaitingRoom;
/**
 * Sends select menu with other players to users to select random or specific victim
 * @param players KeyedPlayers
 * @param channel
 */
const sendVictimSelectMenu = async (players, channel) => {
    const playerArr = Object.values(players);
    const victims = playerArr
        .filter((player) => !player.dead)
        .map((player) => ({
        label: `Attack ${player.username}`,
        description: ' ',
        value: player.discordId,
    }));
    const victimSelectMenu = new discord_js_1.ActionRowBuilder().addComponents(new discord_js_1.SelectMenuBuilder()
        .setCustomId('select-victim')
        .setPlaceholder('Attack a random victim')
        .addOptions([
        {
            label: `Attack a random victim`,
            description: ' ',
            value: 'random',
        },
        ...victims,
    ]));
    await channel.send({
        //@ts-ignore
        components: [victimSelectMenu],
    });
};
