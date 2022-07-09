import { ObjectId } from 'mongodb'
import Asset from './asset'

export default class User {
  constructor(
    public username: string,
    public discordId: string,
    public address: string,
    public assets: Asset[], // assetId
    public hoot: number,
    public _id?: ObjectId,
    public yaoWins?: number,
    public coolDowns?: { [key: string]: number } // timestamp
  ) {
    this.yaoWins = 0
    this.coolDowns = {}
  }
}
