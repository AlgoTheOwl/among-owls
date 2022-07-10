import Asset from '../models/asset'
import { AlgoAsset, AlgoAssetData } from '../types/user'
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

export const determineOwnership = async function (
  address: string
): Promise<{ walletOwned: boolean; nftsOwned: Asset[] | [] }> {
  try {
    let { assets } = await algodClient.accountInformation(address).do()
    const { maxAssets } = settings

    let walletOwned = false
    const nftsOwned: Asset[] = []

    // Create array of unique assetIds
    const uniqueAssets: AlgoAsset[] = []
    assets.forEach((asset: AlgoAsset) => {
      // Check if opt-in asset
      if (asset['asset-id'] === Number(optInAssetId)) {
        walletOwned = true
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
    }
  } catch (error) {
    console.log(error)
    return {
      walletOwned: false,
      nftsOwned: [],
    }
  }
}

export const findAsset = async (
  assetId: number
): Promise<AlgoAssetData | undefined> => {
  try {
    const assetData = await algoIndexer.lookupAssetByID(assetId).do()
    if (assetData?.asset) return assetData.asset
  } catch (error) {
    // console.log(error)
  }
}

export const claimHoot = async (amount: number, receiverAddress: string) => {
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
  const confirmedTxn = await algosdk.waitForConfirmation(
    algodClient,
    xtx.txId,
    4
  )
  console.log(
    'Transaction ' +
      xtx.txId +
      ' confirmed in round ' +
      confirmedTxn['confirmed-round']
  )
}
