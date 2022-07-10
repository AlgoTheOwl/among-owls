import { ObjectId } from 'mongodb'

export default class Asset {
  constructor(
    public assetId: number,
    public assetName: string,
    public assetUrl: string,
    public unitName: string,
    public userId?: ObjectId,
    public localPath?: string,
    public wins?: number
  ) {}
}
