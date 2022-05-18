import { MessageEmbed } from 'discord.js';
import { EmbedData, EmbedReply } from '../types/game';

export default function doEmbed(data: EmbedData): EmbedReply {
  let { title, description, color, image, thumbNail, fields } = data;

  const embed = new MessageEmbed();

  console.log('image before', image);

  if (image?.slice(0, 4) === 'ipfs') {
    const ifpsHash = image.slice(7);
    image = `https://dweb.link/ipfs/${ifpsHash}`;
  }

  console.log('image after', image);

  title && embed.setTitle(title);
  description && embed.setDescription(description);
  color && embed.setColor(color);
  image && embed.setImage(image);
  thumbNail && embed.setThumbnail(thumbNail);
  fields && embed.setFields(fields);

  return {
    embeds: [embed],
    fetchReply: true,
  };
}
