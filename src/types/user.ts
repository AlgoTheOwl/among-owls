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

export interface AlgoAssetResponse {
  assets: AlgoAssetData[]
}

export interface RegistrationResult {
  status: string
  asset?: Asset
  registeredUser?: User
}

export interface TxnData {
  'current-round': number
  'next-token': string
  transactions: Txn[]
}

export interface Txn {
  'asset-config-transaction': {
    'asset-id': number
    params: {
      creator: string
      decimals: number
      'default-frozen': boolean
      manager: number
      reserve: number
      total: number
    }
  }
  'close-rewards': number
  'closing-amount': number
  'confirmed-round': number
  fee: number
  'first-valid': number
  'genesis-hash': string
  'genesis-id': string
  id: string
  'intra-round-offset': number
  'last-valid': number
  note: string
  'receiver-rewards': number
  'round-time': number
  sender: string
  'sender-rewards': number
  signature: {
    sig: string
  }
  'tx-type': string
}
