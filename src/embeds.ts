import { MessageAttachment, MessageEmbed } from 'discord.js'
import { EmbedData, EmbedReply } from './types/game'

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

export default function doEmbed(data: EmbedData): EmbedReply {
  let { title, description, color, image, thumbNail, fields, footer } = {
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
  color && embed.setColor(color)
  image && embed.setImage(image)
  thumbNail && embed.setThumbnail(thumbNail)
  fields && embed.addFields(fields)
  footer && embed.setFooter(footer)

  return {
    embeds: [embed],
    fetchReply: true,
  }
}
