import { ObjectId } from 'mongodb'
import { KeyedAssets } from './asset'

export default class User {
  constructor(
    public username: string,
    public discordId: string,
    public address: string,
    public assets: KeyedAssets,
    public hoot: number,
    public holdingsRefreshDate: number, // timestamp
    public _id?: ObjectId,
    public yaoWins?: number,
    public yaoLosses?: number,
    public yaoKos?: number,
    public coolDowns?: { [key: string]: number }, // timestamp
    public selectedAssetId?: number
  ) {
    this.yaoWins = 0
    this.coolDowns = {}
  }
}
