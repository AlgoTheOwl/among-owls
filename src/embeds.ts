import {
  MessageEmbed,
  MessageActionRow,
  MessageSelectMenu,
  MessageButton,
  ColorResolvable,
  MessageAttachment,
} from 'discord.js'
import { EmbedData, EmbedReply } from './types/game'
import { game } from '.'
import Player from './models/player'
import embeds from './constants/embeds'
import { mapPlayersForEmbed } from './utils/helpers'

const ipfsGateway = process.env.IPFS_GATEWAY

const defaultEmbedValues: EmbedData = {
  title: '🔥 Ye Among AOWLs 🔥',
  description: '💀 Who will survive? 💀',
  color: 'DARK_AQUA',
  image: 'attachment://main.gif',
  thumbNail: 'https://www.randgallery.com/wp-content/uploads/2021/11/owl.jpg',
  footer: {
    text: 'A HootGang Production',
    iconUrl: 'https://www.randgallery.com/wp-content/uploads/2021/11/owl.jpg',
  },
}

export default function doEmbed(type: string, options?: EmbedData): EmbedReply {
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
      thumbNail:
        'https://www.randgallery.com/wp-content/uploads/2021/11/owl.jpg',
      fields,
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
    const imagePath = `src/images/${options?.countDown}.png`
    const countDownImage = new MessageAttachment(imagePath)
    data = {
      title: 'Ready your AOWLS!',
      description: `Game starting in ${options?.countDown}...`,
      files: [countDownImage],
      image: `attachment://${options?.countDown}.png`,
    }
  }

  if (type === embeds.timedOut) {
    data = {
      title: 'BOOOO!!!',
      description:
        'Game has ended due to all players being removed for inactivity',
    }
  }

  if (options && type === embeds.win) {
    const { player, winByTimeout } = options
    data = {
      title: 'WINNER!!!',
      description: `${player?.username}'s ${player?.asset.assetName} ${
        winByTimeout
          ? 'won by default - all other players timed out!'
          : `destroyed the competition`
      }`,
      color: 'DARK_AQUA',
      image: player?.asset.assetUrl,
    }
  }

  if (options && type === embeds.leaderBoard) {
    const { fields } = options

    data = {
      title: 'Leaderboard',
      description: 'Which AOWLs rule them all?',
      fields,
    }
  }

  if (type === embeds.stopped) {
    data = {
      title: 'Game stopped',
      description: 'Game has been stopped',
    }
  }

  let { title, description, color, image, thumbNail, fields, footer, files } = {
    ...defaultEmbedValues,
    ...data,
  }

  const embed = new MessageEmbed()

  if (image?.slice(0, 4) === 'ipfs') {
    const ifpsHash = image.slice(7)
    image = `${ipfsGateway}${ifpsHash}`
  }

  title && embed.setTitle(title)
  description && embed.setDescription(description)
  color && embed.setColor(color as ColorResolvable)
  image && embed.setImage(image)
  thumbNail && embed.setThumbnail(thumbNail)
  fields?.length && embed.addFields(fields)
  footer && embed.setFooter(footer)

  return {
    embeds: [embed],
    fetchReply: true,
    components,
    files: files?.length ? files : undefined,
  }
}
