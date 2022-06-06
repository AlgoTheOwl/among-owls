import { SlashCommandBuilder } from '@discordjs/builders'
import { REST } from '@discordjs/rest'
import { Routes } from 'discord-api-types/v9'

const clientId: string = process.env.DISCORD_CLIENT_ID
const guildId: string = process.env.DISCORD_GUILD_ID
const token: string = process.env.DISCORD_TOKEN

const commands = [
  new SlashCommandBuilder()
    .setName('start')
    .setDescription('start When AOWLS Attack'),
  new SlashCommandBuilder()
    .setName('register')
    .setDescription('register for When AOWLS Attack')
    .addStringOption((option) =>
      option
        .setName('address')
        .setDescription('enter the your wallet address')
        .setRequired(true)
    )
    .addNumberOption((option) =>
      option
        .setName('assetid')
        .setDescription('enter your AOWLS asset ID')
        .setRequired(true)
    ),
  new SlashCommandBuilder()
    .setName('attack')
    .setDescription('Attack another user!')
    .addUserOption((option) => {
      return option
        .setName('victim')
        .setDescription('The user')
        .setRequired(true)
    }),
  new SlashCommandBuilder()
    .setName('stop')
    .setDescription('Stop the current game'),
  new SlashCommandBuilder()
    .setName('test-attack')
    .setDescription('test attacking'),
  new SlashCommandBuilder()
    .setName('test-register')
    .setDescription('register multiple mock users'),
  new SlashCommandBuilder()
    .setName('leaderboard')
    .setDescription('show global leaderboard for AOWL games'),
  new SlashCommandBuilder()
    .setName('view-regisration')
    .setDescription('View how many players have registered'),
].map((command) => command.toJSON())

const rest = new REST({ version: '9' }).setToken(token)

rest
  .put(Routes.applicationGuildCommands(clientId, guildId), { body: commands })
  .then(() => console.log('Successfully registered application commands.'))
  .catch(console.error)
