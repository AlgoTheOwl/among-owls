import Asset from '../models/asset'
import { AlgoAsset, AlgoAssetData, AlgoAssetResponse } from '../types/user'
import { asyncForEach } from './helpers'
import algosdk from 'algosdk'
import settings from '../settings'

const algoNode: string = process.env.ALGO_NODE
const pureStakeApi: string = process.env.PURESTAKE_API
const algoIndexerNode: string = process.env.ALGO_INDEXER_NODE
const optInAssetId: number = Number(process.env.OPT_IN_ASSET_ID)
const unitPrefix: string = process.env.UNIT_NAME
const hootAccountMnemonic: string = process.env.HOOT_SOURCE_MNEMONIC

const token = {
  'X-API-Key': pureStakeApi,
}
const server: string = algoNode
const indexerServer: string = algoIndexerNode
const port = ''

const algodClient = new algosdk.Algodv2(token, server, port)
const algoIndexer = new algosdk.Indexer(token, indexerServer, port)

export const determineOwnership = async function (address: string): Promise<{
  walletOwned: boolean
  nftsOwned: Asset[] | []
  hootOwned: number
}> {
  try {
    let { assets } = await algoIndexer.lookupAccountAssets(address).do()

    const { maxAssets } = settings

    let walletOwned = false
    const nftsOwned: Asset[] = []
    let hootOwned = 0

    // Create array of unique assetIds
    const uniqueAssets: AlgoAsset[] = []
    assets.forEach((asset: AlgoAsset) => {
      // Check if opt-in asset
      if (asset['asset-id'] === Number(optInAssetId)) {
        walletOwned = true
        hootOwned = asset.amount
      }
      // ensure no duplicate assets
      const result = uniqueAssets.findIndex(
        (item) => asset['asset-id'] === item['asset-id']
      )
      if (result <= -1 && asset.amount > 0) {
        uniqueAssets.push(asset)
      }
    })

    await asyncForEach(uniqueAssets, async (asset: AlgoAsset) => {
      if (nftsOwned.length < maxAssets) {
        const assetId = asset['asset-id']
        const assetData = await findAsset(assetId)
        if (assetData) {
          const { params } = assetData

          if (params[`unit-name`]?.includes(unitPrefix)) {
            const { name, url } = params
            nftsOwned.push(new Asset(assetId, name, url, params['unit-name']))
          }
        }
      }
    })

    return {
      walletOwned,
      nftsOwned,
      hootOwned,
    }
  } catch (error) {
    console.log(error)
    return {
      walletOwned: false,
      nftsOwned: [],
      hootOwned: 0,
    }
  }
}

export const findAsset = async (
  assetId: number
): Promise<AlgoAssetData | undefined> => {
  try {
    const assetData = await algoIndexer.searchForAssets().index(assetId).do()
    if (assetData?.assets) return assetData.assets[0]
  } catch (error) {
    console.log(error)
  }
}

export const claimHoot = async (amount: number, receiverAddress: string) => {
  try {
    const params = await algodClient.getTransactionParams().do()
    const { sk, addr: senderAddress } =
      algosdk.mnemonicToSecretKey(hootAccountMnemonic)

    const revocationTarget = undefined
    const closeRemainderTo = undefined
    const note = undefined
    const assetId = optInAssetId

    let xtxn = algosdk.makeAssetTransferTxnWithSuggestedParams(
      senderAddress,
      receiverAddress,
      closeRemainderTo,
      revocationTarget,
      amount,
      note,
      assetId,
      params
    )

    const rawSignedTxn = xtxn.signTxn(sk)
    let xtx = await algodClient.sendRawTransaction(rawSignedTxn).do()
    return await algosdk.waitForConfirmation(algodClient, xtx.txId, 4)
  } catch (error) {
    console.log(error)
  }
}
