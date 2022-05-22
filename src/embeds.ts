import { MessageEmbed } from 'discord.js'
import { EmbedData, EmbedReply } from './types/game'

const ipfsGateway = process.env.IPFS_GATEWAY

export default function doEmbed(data: EmbedData): EmbedReply {
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
  fields && embed.addFields(fields)
  footer && embed.setFooter(footer)

  return {
    embeds: [embed],
    fetchReply: true,
  }
}
