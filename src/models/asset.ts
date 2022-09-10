import { ObjectId } from 'mongodb'

export default class Asset {
  constructor(
    public assetId: number,
    public assetName: string,
    public assetUrl: string,
    public unitName: string,
    public wins: number,
    public losses: number,
    public kos: number,
    public userId?: ObjectId,
    public localPath?: string,
    public alias?: string
  ) {}
}

// Assets keyed by assetId
export type KeyedAssets = { [key: string]: Asset }
