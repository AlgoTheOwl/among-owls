import User from './models/user';
import doEmbed from './services/embeds';
import {
  Client,
  Intents,
  User as Player,
  Interaction,
  ColorResolvable,
} from 'discord.js';
import { processRegistration } from './utils/register';
import { RegistrationResult } from './types/user';
import { connectToDatabase } from './services/database.service';
const token: string = process.env.DISCORD_TOKEN;

const client: Client = new Client({
  intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_EMOJIS_AND_STICKERS],
});

client.once('ready', async () => {
  await connectToDatabase();
  console.log('When Owls Attack - Server ready');
});

client.on('interactionCreate', async (interaction: Interaction) => {
  if (!interaction.isCommand()) return;

  const { commandName, options, user } = interaction;
  if (commandName === 'start') {
    // start game with options
  }

  if (commandName === 'register') {
    // interaction.deferReply();

    const address = options.getString('address');
    const assetId = options.getNumber('assetid');

    const { username, id } = interaction.user;

    if (address && assetId) {
      const registrant = new User(username, id, address, { assetId });

      const { status, asset, registeredUser }: RegistrationResult =
        await processRegistration(registrant, address, assetId);

      const embedData = {
        title: 'Register',
        description: status,
        image: asset?.assetUrl,
        color: 'BLURPLE' as ColorResolvable,
      };

      await interaction.reply(doEmbed(embedData));
    }
  }

  if (commandName === 'attack') {
    // const player = options.getOption('player');
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
