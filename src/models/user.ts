import { ObjectId } from 'mongodb';
import { Asset } from '../types/user';

export default class User {
  constructor(
    public username: string,
    public discordId: string,
    public address: string,
    public asset: Asset,
    public id?: ObjectId
  ) {}
}
