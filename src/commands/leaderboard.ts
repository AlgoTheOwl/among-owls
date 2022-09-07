// Discord
import { SlashCommandBuilder } from '@discordjs/builders'
import {
  ActionRowBuilder,
  Interaction,
  InteractionType,
  SelectMenuBuilder,
} from 'discord.js'

// Data

// Schemas

// Helpers

module.exports = {
  data: new SlashCommandBuilder()
    .setName('leaderboard')
    .setDescription('show global leaderboard for AOWL games'),
  enabled: true,
  async execute(interaction: Interaction) {
    if (interaction.type !== InteractionType.ApplicationCommand) return

    const options = [
      {
        label: 'KOs',
        description: 'See AOWLs ranked by KOs',
        value: 'leaderboard-kos',
      },
      {
        label: 'Wins',
        description: 'See AOWLs ranked by wins',
        value: 'leaderboard-wins',
      },
      {
        label: 'KOd',
        description: 'See AOWLs ranked by losses',
        value: 'leaderboard-kod',
      },
    ]

    const selectMenu = new SelectMenuBuilder()
      .setCustomId('leaderboard-select')
      .setPlaceholder('Select leaderboard')
      .addOptions(options)

    const row = new ActionRowBuilder().addComponents(selectMenu)
    interaction.reply({
      content: 'Choose leaderboard type',
      //@ts-ignore
      components: [row],
    })
    // const { channelId } = interaction

    // const winningUsers = (await collections.users
    //   .find({ yaoWins: { $gt: 0 } })
    //   .limit(10)
    //   .sort({ yaoWins: 'desc' })
    //   .toArray()) as WithId<User>[]

    // const fields = winningUsers.map((user, i) => {
    //   const place = i + 1
    //   const win = user.yaoWins === 1 ? 'win' : 'wins'
    //   return {
    //     name: `#${place}: ${user.username}`,
    //     value: `${user.yaoWins} ${win}`,
    //   }
    // })

    // if (fields?.length) {
    //   await interaction.reply(
    //     doEmbed(embeds.leaderBoard, channelId, {
    //       fields,
    //     }) as InteractionReplyOptions
    //   )
    // } else {
    //   await interaction.reply({ content: 'no winners yet!', ephemeral: true })
    // }
  },
}
