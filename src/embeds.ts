import {
  MessageEmbed,
  MessageActionRow,
  MessageSelectMenu,
  MessageButton,
} from 'discord.js'
import { EmbedData, EmbedReply } from './types/game'
import { game } from '.'
import Player from './models/player'

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
  isMain: true,
}

export default function doEmbed(data: EmbedData): EmbedReply {
  let {
    title,
    description,
    color,
    image,
    thumbNail,
    fields,
    footer,
    isMain,
    isWaitingRoom,
  } = {
    ...defaultEmbedValues,
    ...data,
  }

  let components = []

  if (isWaitingRoom && !game.active) {
    components.push(
      new MessageActionRow().addComponents(
        new MessageButton()
          .setCustomId('select-attacker')
          .setLabel('Choose your AOWL')
          .setStyle('PRIMARY')
      )
    )
  }

  // If it's the main embed, add all the good stuff
  if (!isWaitingRoom && isMain && game.active) {
    const playerArr = Object.values(game.players)

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
