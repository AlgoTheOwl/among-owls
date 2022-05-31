import { ObjectId } from 'mongodb'

export default class User {
  constructor(
    public username: string,
    public discordId: string,
    public address: string,
    public assets: number[], // assetId
    public _id?: ObjectId
  ) {}
}
