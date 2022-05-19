import User from './models/user';
import doEmbed from './services/embeds';
import { Client, Intents, Interaction, ColorResolvable } from 'discord.js';
import { processRegistration } from './utils/register';
import { connectToDatabase } from './services/database.service';
import { fetchPlayers } from './services/operations';
import Game from './models/game';
import { EmbedData } from './types/game';

const token: string = process.env.DISCORD_TOKEN;

const hp = 1000;

export let game: Game | undefined;

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
    // grab players
    const players: User[] = await fetchPlayers();
    const gamePlayers: { [key: string]: User } = {};
    players.forEach((player) => {
      const { username, discordId, address, asset } = player;
      gamePlayers[username] = new User(
        username,
        discordId,
        address,
        asset,
        hp,
        undefined
      );
    });

    // instansiate new game
    game = new Game(gamePlayers, true, false, 1000);
    // send back game embed
    const embedData: EmbedData = {
      title: 'When Owls Attack',
      description: 'Test description',
      color: 'DARK_AQUA',
      fields: Object.values(gamePlayers).map((player) => ({
        name: player.username,
        value: `HP: ${player.hp}`,
      })),
    };
    // if lose, remove loser from players and play game again
    game.embed = await interaction.reply(doEmbed(embedData));
  }

  if (commandName === 'register') {
    const address = options.getString('address');
    const assetId = options.getNumber('assetid');

    const { username, id } = user;

    if (address && assetId) {
      const registrant = new User(username, id, address, { assetId }, hp);

      const { status, asset } = await processRegistration(
        registrant,
        address,
        assetId
      );

      const embedData: EmbedData = {
        title: 'Register',
        description: status,
        image: asset?.assetUrl,
        color: 'BLURPLE' as ColorResolvable,
      };

      await interaction.reply(doEmbed(embedData));
    }
  }

  if (commandName === 'attack') {
    const user = options.getUser('victim');
    // reduce hp from other player chosen
    // send back message with image of nft with damage
    interaction.reply('attacked');
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
