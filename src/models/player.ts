import { ObjectId } from 'mongodb'
import Asset from './asset'

export default class Player {
  win: boolean
  dead: boolean
  kos: number
  coolDownTimeLeft: number

  constructor(
    public username: string,
    public discordId: string,
    public address: string,
    public asset: Asset,
    public hp: number,
    public victimId?: string // public win?: boolean
  ) {
    this.coolDownTimeLeft = 0
    this.dead = false
    this.win = false
    this.kos = 0
  }
}
