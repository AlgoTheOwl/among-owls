import { ColorResolvable, MessageEmbed } from 'discord.js'
import User from '../models/user'

export interface EmbedData {
  title?: string
  description?: string
  color?: ColorResolvable
  image?: string
  thumbNail?: string
  fields?: Field[]
  footer?: Footer
}

type Field = {
  name: string
  value: string | number
}

type Footer = {
  text: string
  iconUrl: string
}

export interface EmbedReply {
  embeds: [MessageEmbed]
  files: any
  fetchReply: boolean
}
