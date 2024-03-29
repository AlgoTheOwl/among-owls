// Discord
import { SelectMenuInteraction } from 'discord.js'
import { SlashCommandBuilder } from '@discordjs/builders'
// Data
import { collections } from '../database/database.service'
// Schemas
import Asset from '../models/asset'
import { WithId } from 'mongodb'
import User from '../models/user'
import Player from '../models/player'
// Helpers
import { updateGame, checkIfRegisteredPlayer } from '../utils/gameplay'
import { downloadAssetImage } from '../utils/fileSystem'
import fs from 'fs'
// Globals
import { games } from '../index'
import { getSettings } from '../utils/settings'

module.exports = {
  data: new SlashCommandBuilder()
    .setName('register-player')
    .setDescription('Register an active player'),
  /**
   * Select menu command that registers a chosen asset into battle
   * @param interaction {SelectMenuInteraction}
   * @returns {void}
   */
  async execute(interaction: SelectMenuInteraction) {
    try {
      if (!interaction.isSelectMenu()) return

      const { values, user, channelId } = interaction
      const game = games[channelId]

      if (!game.waitingRoom) return

      const assetId = values[0]
      const { username, id } = user
      const { hp, maxCapacity } = await getSettings(channelId)

      // Check if user is another game
      if (checkIfRegisteredPlayer(games, assetId, id)) {
        return interaction.reply({
          ephemeral: true,
          content: `You can't register with the same AOWL in two games at a time`,
        })
      }

      // Check for game capacity, allow already registered user to re-register
      // even if capacity is full
      if (
        Object.values(game.players).length < maxCapacity ||
        game.players[id]
      ) {
        await interaction.deferReply({ ephemeral: true })

        const { assets, address, _id, coolDowns } =
          (await collections.users.findOne({
            discordId: user.id,
          })) as WithId<User>

        const asset = assets[assetId]

        if (!asset) {
          return
        }

        const coolDown = coolDowns ? coolDowns[assetId] : null

        if (coolDown && coolDown > Date.now()) {
          const minutesLeft = Math.floor((coolDown - Date.now()) / 60000)
          const minuteWord = minutesLeft === 1 ? 'minute' : 'minutes'
          return interaction.editReply({
            content: `Please wait ${minutesLeft} ${minuteWord} before playing ${asset.assetName} again`,
          })
        }

        let localPath

        try {
          // Create file for channel and download image
          const path = `dist/nftAssets/${channelId}`
          if (!fs.existsSync(path)) {
            fs.mkdir(path, (err) => {})
          }

          localPath = await downloadAssetImage(asset, path, username)
        } catch (error) {
          console.log('****** ERROR DOWNLOADING ******', error)
        }

        if (!localPath) {
          return
        }

        const gameAsset = new Asset(
          asset.assetId,
          asset.assetName,
          asset.assetUrl,
          asset.unitName,
          asset.wins || 0,
          asset.losses || 0,
          asset.kos || 0,
          _id,
          localPath,
          asset.alias
        )

        // check again for capacity once added
        if (
          Object.values(game.players).length >= maxCapacity &&
          !game.players[id]
        ) {
          return interaction.editReply(
            'Sorry, the game is at capacity, please wait until the next round'
          )
        }

        game.players[id] = new Player(username, id, address, gameAsset, hp)

        await interaction.editReply(
          `${asset.alias || asset.assetName} has entered the game`
        )
        updateGame(channelId)
      } else {
        interaction.reply({
          content:
            'Sorry, the game is at capacity, please wait until the next round',
          ephemeral: true,
        })
      }
    } catch (error) {
      console.log('****** ERROR REGISTERING ******', error)
    }
  },
}
