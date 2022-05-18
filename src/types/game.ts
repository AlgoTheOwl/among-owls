import { ColorResolvable, MessageEmbed } from 'discord.js';
export interface GameState {
  players: string;
}

export interface EmbedData {
  title?: string;
  description?: string;
  color?: ColorResolvable;
  image?: string;
  thumbNail?: string;
  fields?: Field[];
}

interface Field {
  name: string;
  value: string;
}

export interface EmbedReply {
  embeds: [MessageEmbed];
  fetchReply: boolean;
}
