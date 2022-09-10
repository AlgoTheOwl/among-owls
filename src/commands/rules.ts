// Discord
import { SlashCommandBuilder } from '@discordjs/builders'
import { Interaction, InteractionType } from 'discord.js'

module.exports = {
  data: new SlashCommandBuilder()
    .setName('rules')
    .setDescription('see game rules'),
  enabled: true,
  /**
   * Sends game rules to client
   * @param interaction {Interaction}
   * @returns {void}
   */
  async execute(interaction: Interaction) {
    if (interaction.type !== InteractionType.ApplicationCommand) return

    const optInAssetId = process.env.OPT_IN_ASSET_ID

    return interaction.reply({
      ephemeral: true,
      content: `GAME RULES:\n- Opt into asset ID: ${optInAssetId}\n- /register in bot-cmd discord channel\n- Game auto-starts when lobby fills with 4 AOWLs\n- Random damage\n- 30 minute cooldown for each AOWL after battle\n-Winner awarded 5 $HOOT per battle, just type /claim after your victory\n- Slash commands /register, /leaderboard, /rename`,
    })
  },
}
