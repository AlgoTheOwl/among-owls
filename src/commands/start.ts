import { Interaction, MessageAttachment } from 'discord.js'
import Game from '../models/game'
import { asyncForEach, downloadFile, emptyDir } from '../utils/helpers'
import { EmbedData } from '../types/game'
import Asset from '../models/asset'
import doEmbed from '../embeds'
import { mapPlayersForEmbed } from '../utils/helpers'
import Player from '../models/player'
import { collections } from '../database/database.service'
import { WithId } from 'mongodb'
import { SlashCommandBuilder } from '@discordjs/builders'
import { confirmRole } from '../utils/helpers'
import { game } from '..'
import settings from '../settings'

const { hp } = settings
const roleId: string = process.env.ADMIN_ID

const imageDir = 'dist/nftAssets'

module.exports = {
  data: new SlashCommandBuilder()
    .setName('start')
    .setDescription('start When AOWLS Attack'),
  async execute(interaction: Interaction) {
    if (!interaction.isCommand()) return

    const { user } = interaction

    const hasRole = await confirmRole(roleId, interaction, user.id)

    if (!hasRole) {
      return await interaction.reply({
        content: 'Only administrators can use this command',
        ephemeral: true,
      })
    }

    if (game?.active) {
      return await interaction.reply({
        content: 'A game is already running',
        ephemeral: true,
      })
    }

    const players = (await collections.yaoPlayers
      .find({})
      .toArray()) as WithId<Player>[]

    if (players.length < 2) {
      return await interaction.reply({
        content: 'There are not enough players to start the game',
        ephemeral: true,
      })
    }

    await interaction.deferReply()

    const gamePlayers: { [key: string]: Player } = {}

    // empty image directory
    emptyDir(imageDir)

    await asyncForEach(players, async (player: Player) => {
      const { username, discordId, address, asset, userId } = player

      // save each image locally for use later
      const localPath = await downloadFile(asset, imageDir, username)

      if (localPath) {
        const assetWithLocalPath: Asset = { ...asset, localPath }

        gamePlayers[discordId] = new Player(
          username,
          discordId,
          address,
          assetWithLocalPath,
          userId,
          hp,
          0
        )
      } else {
        // error downloading
        await interaction.followUp({
          content:
            'Error downloading assets from the blockchain, please try again',
          ephemeral: true,
        })
      }
    })

    const playerArr = Object.values(gamePlayers)

    // send back game embed
    const embedData: EmbedData = {
      image: undefined,
      fields: mapPlayersForEmbed(playerArr),
      description: 'Leaderboard',
      isMain: true,
    }

    const file = new MessageAttachment('src/images/main.gif')

    // send embed here
    await interaction.editReply({ files: [file] })

    // start game
    game.players = gamePlayers
    game.active = true
    game.embed = await interaction.followUp(doEmbed(embedData))
  },
}
