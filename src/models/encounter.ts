import Player from './player'
import { ObjectId } from 'mongodb'

export default class Encounter {
  constructor(
    public players: { [key: discordId]: Player },
    public rounds: number,
    public winnerId: ObjectId,
    public winningAssetId: number,
    public startTime: number,
    public endTime: number,
    public channelId: string
  ) {}
}

type discordId = string
