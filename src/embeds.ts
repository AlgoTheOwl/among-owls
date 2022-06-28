import {
  MessageEmbed,
  MessageActionRow,
  MessageSelectMenu,
  MessageButton,
} from 'discord.js'
import { EmbedData, EmbedReply } from './types/game'
import { game } from '.'
import Player from './models/player'
import embeds from './constants/embeds'
import { mapPlayersForEmbed } from './utils/helpers'
import { collections } from './database/database.service'
import { WithId } from 'mongodb'
import User from './models/user'

const ipfsGateway = process.env.IPFS_GATEWAY

const defaultOptions = {
  thumbNail: 'https://www.randgallery.com/wp-content/uploads/2021/11/owl.jpg',
}

export default async function doEmbed(
  type: string,
  options?: any
): Promise<EmbedReply> {
  let data: EmbedData = {}
  let components = []
  const playerArr = Object.values(game.players)
  const playerCount = playerArr.length

  if (type === embeds.waitingRoom) {
    const playerWord = playerCount === 1 ? 'player' : 'players'
    const hasWord = playerCount === 1 ? 'has' : 'have'

    data = {
      title: '🦉 Waiting Room 🦉',
      description: `${playerCount} ${playerWord} ${hasWord} joined the game.`,
      fields: playerArr.map((player) => {
        return {
          name: player.username,
          value: player.asset.assetName,
        }
      }),
    }

    components.push(
      new MessageActionRow().addComponents(
        new MessageButton()
          .setCustomId('select-attacker')
          .setLabel('Choose your AOWL')
          .setStyle('PRIMARY')
      )
    )
  }

  if (type === embeds.activeGame) {
    data = {
      title: '🔥 Ye Among AOWLs 🔥',
      description: '💀 Who will survive? 💀',
      color: 'DARK_AQUA',
      thumbNail:
        'https://www.randgallery.com/wp-content/uploads/2021/11/owl.jpg',
      fields: options.fields
        ? options.fields
        : mapPlayersForEmbed(playerArr, 'game'),
      footer: {
        text: 'A HootGang Production',
      },
    }

    const victims = playerArr
      .filter((player: Player) => !player.timedOut && !player.dead)
      .map((player: Player) => ({
        label: `Attack ${player.username}`,
        description: '',
        value: player.discordId,
      }))

    components.push(
      new MessageActionRow().addComponents(
        new MessageButton()
          .setCustomId('attack')
          .setLabel('Attack!')
          .setStyle('DANGER'),
        new MessageButton()
          .setCustomId('random-attack')
          .setLabel('Blindly attack!')
          .setStyle('DANGER')
      ),
      new MessageActionRow().addComponents(
        new MessageSelectMenu()
          .setCustomId('select-victim')
          .setPlaceholder('Select a victim to attack')
          .addOptions(victims)
      )
    )
  }

  if (type === embeds.countDown) {
    data = {
      ...defaultOptions,
      title: 'Ready your AOWLS!',
      description: `Game starting in ${options.countDown}...`,
    }
  }

  if (type === embeds.timedOut) {
    data = {
      ...defaultOptions,
      title: 'BOOOO!!!',
      description:
        'Game has ended due to all players being removed for inactivity',
    }
  }

  if (type === embeds.win) {
    const { player, winByTimeout } = options
    data = {
      title: 'WINNER!!!',
      description: `${player.username}'s ${player.asset.unitName} ${
        winByTimeout
          ? 'won by default - all other players timed out!'
          : `destroyed the competition`
      }`,
      color: 'DARK_AQUA',
      image: player.asset.assetUrl,
    }
  }

  if (type === embeds.leaderBoard) {
    const winningUsers = (await collections.users
      .find({ yaoWins: { $gt: 0 } })
      .limit(10)
      .sort({ yaoWins: 'desc' })
      .toArray()) as WithId<User>[]

    if (winningUsers.length) {
      data = {
        title: 'Leaderboard',
        description: 'Which AOWLs rule them all?',
        image: undefined,
        fields: winningUsers.map((user, i) => {
          const place = i + 1
          const win = user.yaoWins === 1 ? 'win' : 'wins'
          return {
            name: `#${place}: ${user.username}`,
            value: `${user.yaoWins} ${win}`,
          }
        }),
      }
    }
  }

  let { title, description, color, image, thumbNail, fields, footer } = data

  const embed = new MessageEmbed()

  if (image?.slice(0, 4) === 'ipfs') {
    const ifpsHash = image.slice(7)
    image = `${ipfsGateway}${ifpsHash}`
  }

  title && embed.setTitle(title)
  description && embed.setDescription(description)
  color && embed.setColor(color)
  image && embed.setImage(image)
  thumbNail && embed.setThumbnail(thumbNail)
  fields?.length && embed.addFields(fields)
  footer && embed.setFooter(footer)

  return {
    embeds: [embed],
    fetchReply: true,
    components,
  }
}
