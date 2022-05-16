import { Client, Intents } from 'discord.js';
const token: string = process.env.DISCORD_TOKEN;

const client: Client = new Client({
  intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_EMOJIS_AND_STICKERS],
});

client.once('ready', () => {
  console.log('Melter ready!');
});

client.on('interactionCreate', async (interaction: any) => {
  if (!interaction.isCommand()) return;

  const { commandName, options, user } = interaction;
  if (commandName === 'start') {
    // start game with options
  }

  if (commandName === 'register') {
    interaction.deferReply();

    const address = options.getString('address');
    const assetId = options.getNumber('assetid');

    // utilize entered data for registration
  }

  if (commandName === 'attack') {
    const player = options.getOption('player');
  }

  /*
   *****************
   * TEST COMMANDS *
   *****************
   */

  // test registring and selecting players
  if (commandName === 'setup-test') {
  }

  // for testing purposes
});

client.login(token);
