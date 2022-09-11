import Asset from '../models/asset'
import { AlgoAsset, AlgoAssetData, Txn, TxnData } from '../types/user'
import { asyncForEach, wait } from './helpers'
import algosdk from 'algosdk'
import fs from 'fs'
import { creatorAddressArr } from '..'

const pureStakeApi = process.env.PURESTAKE_API
const algoIndexerNode = process.env.ALGO_INDEXER_NODE
const optInAssetId: number = Number(process.env.OPT_IN_ASSET_ID)
const unitPrefix = process.env.UNIT_NAME

const token = {
  'X-API-Key': pureStakeApi,
}
const indexerServer: string = algoIndexerNode
const port = ''

const algoIndexer = new algosdk.Indexer(token, indexerServer, port)

/**
 * Grabs users Algo acocunt assets and returns all instances of collection assets
 * Authenticates wallet by ensuring wallet has opted in to game token
 * Tracks users Hoot token amount
 * @param address
 * @param maxAssets
 * @returns {{walletOwned: boolean, nftsOwned: Asset[], hootOwned: number}}
 */
export const determineOwnership = async function (
  address: string,
  maxAssets: number
): Promise<{
  walletOwned: boolean
  nftsOwned: Asset[] | []
  hootOwned: number
}> {
  try {
    await setupTxns()

    let { assets } = await algoIndexer
      .lookupAccountAssets(address)
      .limit(10000)
      .do()

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
      if (assetData) {
        const { params } = assetData

        if (params[`unit-name`]?.includes(unitPrefix)) {
          const { name, url } = params
          nftsOwned.push(
            new Asset(assetId, name, url, params['unit-name'], 0, 0, 0)
          )
        }
      }
      await wait(250)
    })

    return {
      walletOwned,
      nftsOwned,
      hootOwned,
    }
  } catch (error) {
    console.log('****** ERROR DETERMINING OWNERSHIP ******', error)
    return {
      walletOwned: false,
      nftsOwned: [],
      hootOwned: 0,
    }
  }
}

/**
 * Using data from transaction record of creator wallet, produces
 * unique array of all assets created by said wallet
 * @returns {Array}
 */
export const getAssetIdArray = (): number[] => {
  const assetIdArr: number[] = []

  const txnData = getTxnData() as TxnData

  txnData.transactions.forEach((txn: Txn) => {
    const assetId = txn['asset-config-transaction']['asset-id']
    const createdAssetId = txn['created-asset-index']
    if (assetId) {
      const result = assetIdArr.findIndex((item) => item === assetId)
      result <= -1 && assetIdArr.push(assetId)
    }
    if (createdAssetId) {
      const result2 = assetIdArr.findIndex((item) => item === createdAssetId)
      result2 <= -1 && assetIdArr.push(createdAssetId)
    }
  })
  return assetIdArr
}

/**
 * Searches array of collection assets for match of assetId passed to function
 * @param assetId
 * @param assetIdArr
 * @returns {Boolean}
 */
export const isAssetCollectionAsset = (
  assetId: number,
  assetIdArr: number[]
): boolean => assetIdArr.includes(assetId)

/**
 * Finds Asset data on Algo blockchain
 * @param assetId
 * @returns {Promise<AlgoAssetData>}
 */
export const findAsset = async (
  assetId: number
): Promise<AlgoAssetData | undefined> => {
  try {
    const assetData = await algoIndexer.searchForAssets().index(assetId).do()
    if (assetData?.assets) return assetData.assets[0]
  } catch (error) {
    console.log('****** ERROR FINDING ASSET ******', error)
  }
}

/**
 * Checks if we have a txnData file, creates one if not
 * Fetches and reduces txnData from all creator wallets and writes file
 */
export const setupTxns = async (): Promise<void> => {
  let update = true
  if (!fs.existsSync('dist/txnData/txnData.json')) {
    update = false
    fs.writeFileSync('dist/txnData/txnData.json', '')
  }

  const txnData = await convergeTxnData(creatorAddressArr, update)

  fs.writeFileSync('dist/txnData/txnData.json', JSON.stringify(txnData))
}
/**
 * Finds all transactions from address
 * @param address
 * @returns {Promise<TxnData>}
 */
export const searchForTransactions = async (
  address: string
): Promise<TxnData> => {
  const type = 'acfg'
  const txns = (await algoIndexer
    .searchForTransactions()
    .address(address)
    .txType(type)
    .do()) as TxnData

  return txns
}

/**
 * Grabs all transactions from an account address since a specific round
 * @param accountAddress
 * @param currentRound
 * @returns {Promise<TxnData>}
 */
export const fetchRecentTransaction = async (
  accountAddress: string,
  currentRound: number
): Promise<TxnData> => {
  const type = 'acfg'
  return (await algoIndexer
    .searchForTransactions()
    .address(accountAddress)
    .txType(type)
    .minRound(currentRound)
    .do()) as TxnData
}

/**
 * Fetches all data and reduces it to one object
 * @param creatorAddresses
 * @param update
 * @returns {Promise<TxnData>}
 */
export const convergeTxnData = async (
  creatorAddresses: string[],
  update: boolean
): Promise<TxnData> => {
  const updateCalls: any[] = []
  const txnData = getTxnData() as TxnData
  creatorAddresses.forEach((address: string) => {
    if (update) {
      const currentRound = txnData['current-round']
      updateCalls.push(fetchRecentTransaction(address, currentRound))
    } else {
      updateCalls.push(searchForTransactions(address))
    }
  })
  const txnDataArr = await Promise.all(updateCalls)
  const reduceArr = [...txnDataArr]
  if (update) {
    const currentTxnData = getTxnData() as TxnData
    reduceArr.push(currentTxnData)
  }

  return reduceTxnData(reduceArr)
}

/**
 * Reduce operation for each TxnData object
 * @param txnDataArray
 * @returns {TxnData}
 */
const reduceTxnData = (txnDataArray: TxnData[]): TxnData => {
  const reducedData = txnDataArray.reduce(
    (prevTxnData: TxnData, txnData: TxnData) => {
      // select the most recent round
      return {
        ['current-round']:
          prevTxnData['current-round'] < txnData['current-round']
            ? prevTxnData['current-round']
            : txnData['current-round'],
        ['next-token']: prevTxnData['next-token'],
        transactions: [...prevTxnData.transactions, ...txnData.transactions],
      }
    }
  )
  return reducedData
}

/**
 * Grabs and parses transaction data locally
 * @returns {TxnData | undefined}
 */
const getTxnData = (): TxnData | undefined => {
  try {
    return JSON.parse(fs.readFileSync('dist/txnData/txnData.json', 'utf-8'))
  } catch (error) {
    console.log('****** NO TXN DATA PRESENT ******')
  }
}
