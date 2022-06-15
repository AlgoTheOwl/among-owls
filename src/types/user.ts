import User from '../models/user'

export interface Asset {
  assetUrl?: string
  assetName?: string
  assetId: number
  unitName?: string
  localPath?: string
}

export interface AlgoAsset {
  amount: number
  'asset-id': number
  'is-frozen': boolean
}

export interface AlgoAssetData {
  'created-at-round': number
  deleted: false
  index: number
  params: {
    clawback: string
    creator: string
    decimals: number
    'default-frozen': boolean
    freeze: string
    manager: string
    name: string
    'name-b64': string
    reserve: string
    total: number
    'unit-name': string
    'unit-name-b64': string
    url: string
    'url-b64': string
  }
  'current-round': number
}

export interface RegistrationResult {
  status: string
  asset?: Asset
  registeredUser?: User
}
