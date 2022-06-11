import { ColorResolvable, MessageActionRow, MessageEmbed } from 'discord.js'
import Player from '../models/player'
import User from '../models/user'

export interface EmbedData {
  title?: string
  description?: string
  color?: ColorResolvable
  image?: string
  thumbNail?: string
  fields?: Field[]
  footer?: Footer
  isMain?: boolean
}

type Field = {
  name: string
  value: string
}

type Footer = {
  text: string
  iconUrl: string
}

export interface EmbedReply {
  embeds: [MessageEmbed]
  fetchReply: boolean
  components?: MessageActionRow[]
}
