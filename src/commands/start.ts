import { Interaction, MessageAttachment } from 'discord.js'
import Game from '../models/game'
import { asyncForEach, downloadFile, emptyDir, wait } from '../utils/helpers'
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

const { minimumPlayers } = settings
const roleId: string = process.env.ADMIN_ID

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

    // const players = (await collections.yaoPlayers
    //   .find({})
    //   .toArray()) as WithId<Player>[]

    // implement waiting room here

    await interaction.deferReply()

    let playerCount = 0

    while (playerCount < minimumPlayers) {
      try {
        await wait(3000)
        console.log(Object.values(game.players))
        playerCount = Object.values(game.players).length

        const waitingRoomEmbedData: EmbedData = {
          image: undefined,
          title: 'Waiting Room',
          description: `${playerCount} ${
            playerCount === 1 ? 'player' : 'players'
          } have joined the game`,
          isWaitingRoom: true,
        }

        // player clicks join, which sends them a list of the AOWLS they own and can select from
        // they are then sent a select menu, which

        await interaction.editReply(doEmbed(waitingRoomEmbedData))
      } catch (error) {
        // @ts-ignore
        console.log('ERROR', error)
      }

      // implement countdown here
    }

    // if (players.length < 2) {
    //   return await interaction.reply({
    //     content: 'There are not enough players to start the game',
    //     ephemeral: true,
    //   })
    // }

    const gamePlayers: { [key: string]: Player } = {}

    // empty image directory
    // emptyDir(imageDir)

    // if (players) {
    //   await asyncForEach(players, async (player: Player) => {
    //     const { username, discordId, address, asset, userId } = player

    //     // save each image locally for use later
    //     const localPath = await downloadFile(asset, imageDir, username)

    //     if (localPath) {
    //       const assetWithLocalPath: Asset = { ...asset, localPath }

    //       gamePlayers[discordId] = new Player(
    //         username,
    //         discordId,
    //         address,
    //         assetWithLocalPath,
    //         userId,
    //         hp,
    //         0
    //       )
    //     } else {
    //       // error downloading
    //       return await interaction.reply({
    //         content:
    //           'Error downloading assets from the blockchain, please try again',
    //         ephemeral: true,
    //       })
    //     }
    //   })
    // }

    const playerArr = Object.values(gamePlayers)

    // send back game embed
    const embedData: EmbedData = {
      image: undefined,
      fields: mapPlayersForEmbed(playerArr),
      description: 'Leaderboard',
      isMain: true,
    }

    console.log(doEmbed(embedData))

    // const file = new MessageAttachment('src/images/main.gif')

    // // send embed here
    // await interaction.editReply({ files: [file] })

    // start game
    game.players = gamePlayers
    game.active = true
    game.embed = await interaction.followUp(doEmbed(embedData))
  },
}
