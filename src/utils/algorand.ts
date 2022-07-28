import Asset from '../models/asset'
import { AlgoAsset, AlgoAssetData, AlgoAssetResponse } from '../types/user'
import { asyncForEach, wait } from './helpers'
import algosdk from 'algosdk'
import settings from '../settings'
import fs from 'fs'
import txnData from '../txnData/txt.json'

const algoNode = process.env.ALGO_NODE
const pureStakeApi = process.env.PURESTAKE_API
const algoIndexerNode = process.env.ALGO_INDEXER_NODE
const optInAssetId: number = Number(process.env.OPT_IN_ASSET_ID)
const unitPrefix = process.env.UNIT_NAME
const hootAccountMnemonic = process.env.HOOT_SOURCE_MNEMONIC
const creatorAddress = process.env.CREATOR_ADDRESS

const token = {
  'X-API-Key': pureStakeApi,
}
const server: string = algoNode
const indexerServer: string = algoIndexerNode
const port = ''

const algodClient = new algosdk.Algodv2(token, server, port)
const algoIndexer = new algosdk.Indexer(token, indexerServer, port)

const txData = JSON.parse(JSON.stringify(txnData))

export const determineOwnership = async function (address: string): Promise<{
  walletOwned: boolean
  nftsOwned: Asset[] | []
  hootOwned: number
}> {
  try {
    let { assets } = await algoIndexer.lookupAccountAssets(address).do()

    const { maxAssets } = settings

    let walletOwned = false
    const assetIdsOwned: number[] = []
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

    const assetIdArr = getAssetIdArray()

    // Determine which assets are part of bot collection
    uniqueAssets.forEach((asset) => {
      if (assetIdsOwned.length < maxAssets) {
        const assetId = asset['asset-id']
        if (isAssetCollectionAsset(assetId, assetIdArr)) {
          assetIdsOwned.push(assetId)
        }
      }
    })

    // fetch data for each asset but not too quickly
    await asyncForEach(assetIdsOwned, async (assetId: number) => {
      const assetData = await findAsset(assetId)
      console.log(assetData)
      if (assetData) {
        const { params } = assetData

        if (params[`unit-name`]?.includes(unitPrefix)) {
          const { name, url } = params
          nftsOwned.push(new Asset(assetId, name, url, params['unit-name']))
        }
      }
      await wait(1000)
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

export const getAssetIdArray = () => {
  const assetIdArr: number[] = []
  txnData.transactions.forEach((txn) => {
    const assetId = txn['asset-config-transaction']['asset-id']
    const result = assetIdArr.findIndex((item) => item === assetId)
    result <= -1 && assetIdArr.push(assetId)
  })
  return assetIdArr
}

export const isAssetCollectionAsset = (assetId: number, assetIdArr: number[]) =>
  assetIdArr.includes(assetId)

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

export const searchForTransactions = async () => {
  const type = 'acfg'
  const txns = await algoIndexer
    .searchForTransactions()
    .address(creatorAddress)
    .txType(type)
    .do()

  fs.writeFileSync('dist/data/txt.json', JSON.stringify(txns))
}

export const updateTransactions = async () => {
  const currentRound = txnData['current-round']
  const type = 'acfg'
  const account = 'AOWLLUX3BBLDV6KUZYQ7FBZTIWGWRRJO6B5XL2DFQ6WLITHUK26OO7IGMI'
  const newTxns = await algoIndexer
    .searchForTransactions()
    .address(account)
    .txType(type)
    .minRound(currentRound)
    .do()

  const newTxnData = {
    ...txnData,
    trasactions: [txData.transactions, ...newTxns.transactions],
  }

  fs.writeFileSync('dist/data/txt.json', JSON.stringify(newTxnData))
}
