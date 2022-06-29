import { ObjectId } from 'mongodb'
import Asset from './asset'

export default class User {
  constructor(
    public username: string,
    public discordId: string,
    public address: string,
    public assets: Asset[], // assetId
    public _id?: ObjectId,
    public yaoWins?: number,
    public coolDownDone?: number
  ) {
    this.yaoWins = 0
  }
}
