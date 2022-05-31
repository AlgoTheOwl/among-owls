import { ObjectId } from 'mongodb'

export default class Asset {
  constructor(
    public userId: ObjectId,
    public assetId: number,
    public assetName: string,
    public assetUrl: string,
    public unitName: string,
    public localPath?: string
  ) {}
}
