import { ObjectId } from 'mongodb'
import Asset from './asset'

export default class Player {
  constructor(
    public username: string,
    public discordId: string,
    public address: string,
    public asset: Asset,
    public hp: number,
    public coolDownTimeLeft?: number,
    public _id?: ObjectId
  ) {}
}
