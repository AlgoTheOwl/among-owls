import { ObjectId } from 'mongodb'
import Asset from './asset'

interface Indexable {
  [key: string]: any
}

export default class User {
  public getStaticProperty(propertyName: string): number {
    return (User as Indexable)[propertyName]
  }

  constructor(
    public username: string,
    public discordId: string,
    public address: string,
    public assets: { [key: string]: Asset }, // assetId
    public hoot: number,
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
