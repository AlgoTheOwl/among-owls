import { SelectMenuInteraction } from 'discord.js'
import { SlashCommandBuilder } from '@discordjs/builders'
import { game } from '../index'
import { downloadFile, wait } from '../utils/helpers'
import Asset from '../models/asset'
import { collections } from '../database/database.service'
import { WithId } from 'mongodb'
import User from '../models/user'
import settings from '../settings'
import Player from '../models/player'

module.exports = {
  data: new SlashCommandBuilder()
    .setName('register-player')
    .setDescription('Register an active player'),
  async execute(interaction: SelectMenuInteraction) {
    try {
      if (!interaction.isSelectMenu()) return
      if (!game.waitingRoom) return

      const { values, user } = interaction
      const { username, id } = user
      const { imageDir, hp, messageDeleteInterval } = settings

      const { assets, address, _id } = (await collections.users.findOne({
        discordId: user.id,
      })) as WithId<User>

      const asset = assets.find((asset) => asset.assetId === Number(values[0]))

      if (!asset) {
        return
      }

      let localPath

      try {
        localPath = await downloadFile(asset, imageDir, username)
      } catch (error) {
        console.log('download error', error)
      }

      if (!localPath) {
        return
      }

      const gameAsset = new Asset(
        asset.assetId,
        asset.assetName,
        asset.assetUrl,
        asset.unitName,
        _id,
        localPath
      )

      game.players[id] = new Player(
        username,
        id,
        address,
        gameAsset,
        _id,
        hp,
        assets.length,
        0
      )
      interaction.reply(`${asset.assetName} has entered the game`)
      await wait(messageDeleteInterval)
      interaction.deleteReply()
    } catch (error) {
      console.log(error)
    }
  },
}
