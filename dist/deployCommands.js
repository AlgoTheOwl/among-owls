"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const builders_1 = require("@discordjs/builders");
const rest_1 = require("@discordjs/rest");
const v9_1 = require("discord-api-types/v9");
const clientId = process.env.DISCORD_CLIENT_ID;
const guildId = process.env.DISCORD_GUILD_ID;
const token = process.env.DISCORD_TOKEN;
const commands = [
    new builders_1.SlashCommandBuilder()
        .setName('start')
        .setDescription('start When AOWLS Attack'),
    new builders_1.SlashCommandBuilder()
        .setName('register')
        .setDescription('register for When AOWLS Attack')
        .addStringOption((option) => option
        .setName('address')
        .setDescription('enter the your wallet address')
        .setRequired(true))
        .addNumberOption((option) => option
        .setName('assetid')
        .setDescription('enter your AOWLS asset ID')
        .setRequired(true)),
    new builders_1.SlashCommandBuilder()
        .setName('attack')
        .setDescription('Attack another user!')
        .addUserOption((option) => {
        return option
            .setName('victim')
            .setDescription('The user')
            .setRequired(true);
    }),
    new builders_1.SlashCommandBuilder()
        .setName('stop')
        .setDescription('Stop the current game'),
    new builders_1.SlashCommandBuilder()
        .setName('attack-test')
        .setDescription('test attacking'),
].map((command) => command.toJSON());
const rest = new rest_1.REST({ version: '9' }).setToken(token);
rest
    .put(v9_1.Routes.applicationGuildCommands(clientId, guildId), { body: commands })
    .then(() => console.log('Successfully registered application commands.'))
    .catch(console.error);
