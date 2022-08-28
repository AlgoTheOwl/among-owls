import {
  ColorResolvable,
  MessageActionRowComponent,
  Embed,
  Attachment,
} from 'discord.js'
import Player from '../models/player'

export interface EmbedData {
  title?: string
  description?: string
  color?: ColorResolvable
  image?: string
  thumbNail?: string
  fields?: Field[] | []
  footer?: Footer
  countDown?: number
  player?: Player
  winByTimeout?: boolean
  files?: Attachment[]
  rawEmbed?: boolean
}

export type Field = {
  name: string
  value: string | ''
}

type Footer = {
  text: string
  iconUrl?: string
}

export interface EmbedReply {
  embeds: [Embed]
  fetchReply: boolean
  components?: MessageActionRowComponent[]
  files?: Attachment[]
}

export interface Intervals {
  autoGameInterval: ReturnType<typeof setInterval> | null
  playerTimeouts: { [key: string]: ReturnType<typeof setTimeout> }
}

export type Settings = {
  channelName: string
  hp: number
  damageRange: number
  damagePerAowl: number
  imageDir: string
  coolDownInterval: number
  minCapacity: number
  maxCapacity: number
  assetCooldown: number
  maxAssets: number
  waitingRoomRefreshRate: number
  channelId: string
  hootSettings: {
    hootOnWin: number
  }
}
