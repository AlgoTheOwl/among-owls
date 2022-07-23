import {
  MessageEmbed,
  MessageActionRow,
  MessageButton,
  ColorResolvable,
  MessageAttachment,
  MessagePayload,
  InteractionReplyOptions,
  MessageOptions,
} from 'discord.js'
import { EmbedData } from './types/game'
import { game } from '.'
import embeds from './constants/embeds'
import { isIpfs, mapPlayersForEmbed, normalizeIpfsUrl } from './utils/helpers'

const defaultEmbedValues: EmbedData = {
  title: '🔥 Ye Among AOWLs 🔥',
  description: '💀 Who will survive? 💀',
  color: 'DARK_AQUA',
  image: 'attachment://main.gif',
  // thumbNail: 'https://www.randgallery.com/wp-content/uploads/2021/11/owl.jpg',
  footer: {
    text: 'A HootGang Production',
    iconUrl: 'https://www.randgallery.com/wp-content/uploads/2021/11/owl.jpg',
  },
  rawEmbed: false,
}

export default function doEmbed(
  type: string,
  options?: any
):
  | string
  | MessagePayload
  | InteractionReplyOptions
  | MessageEmbed
  | MessageOptions {
  let data: EmbedData = {}
  let components = []
  const playerArr = Object.values(game.players)
  const playerCount = playerArr.length

  // Waiting Room
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
          .setStyle('PRIMARY'),
        new MessageButton()
          .setCustomId('begin-game')
          .setLabel('Start game')
          .setStyle('SECONDARY')
      )
    )
  }

  if (type === embeds.activeGame) {
    const fields = options?.hasOwnProperty('fields')
      ? options.fields
      : mapPlayersForEmbed(playerArr, 'game')
    data = {
      title: '🔥 Ye Among AOWLs 🔥',
      description: '💀 Who will survive? 💀',
      color: 'RANDOM',
      image: undefined,
      fields,
      footer: {
        text: 'A HootGang Production',
      },
    }
  }

  // Waiting Room Countdown
  if (type === embeds.countDown) {
    const imagePath = `src/images/${options?.countDown}.png`
    const countDownImage = new MessageAttachment(imagePath)
    data = {
      title: 'Ready your AOWLS!',
      description: `Game starting in ${options?.countDown}...`,
      files: [countDownImage],
      image: `attachment://${options?.countDown}.png`,
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
    const { player, winByTimeout } = options
    const asserUrl = player.asset.assetUrl

    data = {
      title: 'WINNER!!!',
      description: `${player?.username}'s ${player?.asset.assetName} ${
        winByTimeout
          ? 'won by default - all other players timed out!'
          : `destroyed the competition`
      }`,
      color: 'DARK_AQUA',
      image: normalizeIpfsUrl(asserUrl),
    }
  }

  // Leaderboard
  if (options && type === embeds.leaderBoard) {
    const { fields } = options

    data = {
      title: 'Leaderboard',
      description: 'Which AOWLs rule them all?',
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

  const embed = new MessageEmbed()

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
    components,
    files: files?.length ? files : undefined,
  }
}
