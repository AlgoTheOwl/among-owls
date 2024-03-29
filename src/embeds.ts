// Discord
import {
  ColorResolvable,
  MessagePayload,
  InteractionReplyOptions,
  MessageOptions,
  ButtonStyle,
  ActionRowBuilder,
  ButtonBuilder,
  EmbedBuilder,
} from 'discord.js'
// Types/Constants
import { EmbedData } from './types/game'
import embeds from './constants/embeds'
// Game state
import { games } from '.'
// Helpers
import { mapPlayersForEmbed, normalizeIpfsUrl } from './utils/helpers'

const defaultEmbedValues: EmbedData = {
  title: '🔥 Ye Among AOWLs 🔥',
  description: '💀 Who will survive? 💀',
  color: 'DarkAqua',
  image: 'attachment://main.gif',
  // thumbNail: 'https://www.randgallery.com/wp-content/uploads/2021/11/owl.jpg',
  footer: {
    text: 'A HootGang Production',
    iconUrl: 'https://www.randgallery.com/wp-content/uploads/2021/11/owl.jpg',
  },
  rawEmbed: false,
}

/**
 * Takes embed type and returns Discord message embed object for easy use within commands
 * TODO: move all "options" and async operations into doEmbed function to reduce clutter at command level
 * @param type
 * @param channelId
 * @param options
 * @returns {MessagePayload | InteractionReplyOptions | EmbedBuilder | MessageOptions}
 */
export default function doEmbed(
  type: string,
  channelId: string,
  options?: any
): MessagePayload | InteractionReplyOptions | EmbedBuilder | MessageOptions {
  let data: EmbedData = {}
  let components = []
  const game = games[channelId]

  // Waiting Room
  if (type === embeds.waitingRoom) {
    const playerArr = Object.values(game?.players)
    const playerCount = playerArr.length
    const playerWord = playerCount === 1 ? 'player' : 'players'
    const hasWord = playerCount === 1 ? 'has' : 'have'

    data = {
      title: '🦉 Waiting Room 🦉',
      description: `${playerCount} ${playerWord} ${hasWord} joined the game.`,
      files: [],
      fields: playerArr.map((player) => {
        return {
          name: player.username,
          value: player.asset.alias || player.asset.assetName,
        }
      }),
    }

    components.push(
      new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId('select-attacker')
          .setLabel('Choose your AOWL')
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId('begin-game')
          .setLabel('Start game')
          .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
          .setCustomId('withdraw-player')
          .setLabel('Withdraw AOWL')
          .setStyle(ButtonStyle.Danger)
      )
    )
  }

  if (type === embeds.activeGame) {
    const playerArr = Object.values(game?.players)
    const fields = options?.hasOwnProperty('fields')
      ? options.fields
      : mapPlayersForEmbed(playerArr, 'game')
    data = {
      title: '🔥 Ye Among AOWLs 🔥',
      description: '💀 Who will survive? 💀',
      color: 'Random',
      image: undefined,
      fields,
      footer: {
        text: 'A HootGang Production',
      },
    }
  }

  // Players timed out
  if (type === embeds.timedOut) {
    data = {
      title: 'BOOOO!!!',
      description:
        'Game has ended due to all players being removed for inactivity',
    }
  }

  // Win
  if (options && type === embeds.win) {
    const { player, hootOnWin } = options
    const asserUrl = player.asset.assetUrl
    const { asset, username } = player
    const { alias, assetName } = asset

    data = {
      title: 'WINNER!!!',
      description: `${username}'s ${
        alias || assetName
      } ${`destroyed the competition and won ${hootOnWin} hoot!`}`,
      color: 'DarkAqua',
      image: normalizeIpfsUrl(asserUrl),
    }
  }

  // Leaderboard
  if (options && type === embeds.leaderBoard) {
    const { fields, description } = options

    data = {
      title: 'Leaderboard',
      description,
      fields,
    }
  }

  // Stopped game
  if (type === embeds.stopped) {
    data = {
      title: 'Game stopped',
      description: 'Game has been stopped',
    }
  }

  // User Profile
  if (type === embeds.profile) {
    const { thumbNail, fields } = options
    data = {
      rawEmbed: true,
      thumbNail,
      fields,
      title: 'Your Profile',
      description: '',
    }
  }

  // Asset Profile
  if (type === embeds.assetProfile) {
    const { assetUrl, fields, assetName } = options

    data = {
      title: assetName,
      description: `Your lil' ripper`,
      thumbNail: normalizeIpfsUrl(assetUrl),
      fields,
      footer: {
        text: '*** Hint: Use /rename here to rename this asset ***',
      },
    }
  }

  let {
    title,
    description,
    color,
    image,
    thumbNail,
    fields,
    footer,
    files,
    rawEmbed,
  } = {
    ...defaultEmbedValues,
    ...data,
  }

  const embed = new EmbedBuilder()

  let thumbNailUrl

  if (thumbNail) {
    thumbNailUrl = normalizeIpfsUrl(thumbNail)
  }

  title && embed.setTitle(title)
  description && embed.setDescription(description)
  color && embed.setColor(color as ColorResolvable)
  image && embed.setImage(image)
  thumbNailUrl && embed.setThumbnail(thumbNailUrl)
  fields?.length && embed.addFields(fields)
  footer && embed.setFooter(footer)

  if (rawEmbed) {
    return embed
  }

  return {
    embeds: [embed],
    fetchReply: true,
    //@ts-ignore
    components,
    files: files?.length ? files : undefined,
  }
}
