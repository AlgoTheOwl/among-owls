"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Discord
const builders_1 = require("@discordjs/builders");
// Helpers
const helpers_1 = require("../utils/helpers");
const register_1 = require("../utils/register");
module.exports = {
    data: new builders_1.SlashCommandBuilder()
        .setName('register')
        .setDescription('register for When AOWLS Attack')
        .addStringOption((option) => option
        .setName('address')
        .setDescription('enter the your wallet address')
        .setRequired(true)),
    enabled: true,
    /**
     * Command that commences registration when a user enters their wallet address
     * User must be opted in to OPT_IN_ASSET_ID for this command to work
     * @param interaction {Interaction}
     * @returns {void}
     */
    async execute(interaction) {
        if (!interaction.isChatInputCommand())
            return;
        const { user, options, channelId } = interaction;
        // TODO: add ability to register for different games here
        const address = options.getString('address');
        if (address && !/^[a-zA-Z0-9]{58}$/.test(address)) {
            return interaction.reply({
                content: 'Please enter a valid Algorand wallet address',
                ephemeral: true,
            });
        }
        const { username, id } = user;
        await interaction.deferReply({ ephemeral: true });
        await interaction.followUp({
            content: 'Thanks for registering! This might take a while! Please check back in a few minutes',
            ephemeral: true,
        });
        if (address) {
            const { status, registeredUser, asset } = await (0, register_1.processRegistration)(username, id, address, channelId);
            // add permissions if succesful
            if (registeredUser && asset) {
                (0, helpers_1.addRole)(interaction, process.env.REGISTERED_ID, registeredUser);
            }
            await interaction.followUp({
                ephemeral: true,
                content: status,
            });
        }
    },
};
