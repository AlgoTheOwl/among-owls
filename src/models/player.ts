import { ObjectId } from 'mongodb'
import Asset from './asset'

export default class Player {
  constructor(
    public username: string,
    public discordId: string,
    public address: string,
    public asset: Asset,
    public userId: ObjectId,
    public hp: number,
    public assetMultiplier: number,
    public coolDownTimeLeft: number,
    public rolledRecently?: boolean,
    public timedOut?: boolean,
    public dead?: boolean,
    public victimId?: string
  ) {
    this.rolledRecently = false
    this.timedOut = false
    this.coolDownTimeLeft = 0
    this.dead = false
  }
}
