import { ObjectId } from 'mongodb';
import { Asset } from '../types/user';

// Class Implementation

export default class User {
  constructor(
    public username: string,
    public discordId: number,
    public address: string,
    public asset: Asset,
    public id?: ObjectId
  ) {}
}

// Initialize Connection
