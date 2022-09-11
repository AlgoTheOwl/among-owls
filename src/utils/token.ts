import algosdk from 'algosdk'
import PendingTransactionInformation from 'algosdk/dist/types/src/client/v2/algod/pendingTransactionInformation'

const algoNode = process.env.ALGO_NODE
const hootAccountMnemonic = process.env.HOOT_SOURCE_MNEMONIC
const optInAssetId: number = Number(process.env.OPT_IN_ASSET_ID)
const pureStakeApi = process.env.PURESTAKE_API
const token = {
  'X-API-Key': pureStakeApi,
}
const server: string = algoNode
const port = ''
const algodClient = new algosdk.Algodv2(token, server, port)

/**
 * Executes transaction on Algorand blockchain sending specified amount of token to user
 * @param amount
 * @param receiverAddress
 * @returns
 */
export const claimHoot = async (
  amount: number,
  receiverAddress: string
): Promise<PendingTransactionInformation | undefined> => {
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
    return (await algosdk.waitForConfirmation(
      algodClient,
      xtx.txId,
      4
    )) as PendingTransactionInformation
  } catch (error) {
    console.log('****** ERROR CLAIMING HOOT', error)
  }
}
