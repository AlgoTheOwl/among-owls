"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.claimHoot = void 0;
const algosdk_1 = __importDefault(require("algosdk"));
const algoNode = process.env.ALGO_NODE;
const hootAccountMnemonic = process.env.HOOT_SOURCE_MNEMONIC;
const optInAssetId = Number(process.env.OPT_IN_ASSET_ID);
const pureStakeApi = process.env.PURESTAKE_API;
const token = {
    'X-API-Key': pureStakeApi,
};
const server = algoNode;
const port = '';
const algodClient = new algosdk_1.default.Algodv2(token, server, port);
/**
 * Executes transaction on Algorand blockchain sending specified amount of token to user
 * @param amount
 * @param receiverAddress
 * @returns
 */
const claimHoot = async (amount, receiverAddress) => {
    try {
        const params = await algodClient.getTransactionParams().do();
        const { sk, addr: senderAddress } = algosdk_1.default.mnemonicToSecretKey(hootAccountMnemonic);
        const revocationTarget = undefined;
        const closeRemainderTo = undefined;
        const note = undefined;
        const assetId = optInAssetId;
        let xtxn = algosdk_1.default.makeAssetTransferTxnWithSuggestedParams(senderAddress, receiverAddress, closeRemainderTo, revocationTarget, amount, note, assetId, params);
        const rawSignedTxn = xtxn.signTxn(sk);
        let xtx = await algodClient.sendRawTransaction(rawSignedTxn).do();
        return (await algosdk_1.default.waitForConfirmation(algodClient, xtx.txId, 4));
    }
    catch (error) {
        console.log('****** ERROR CLAIMING HOOT', error);
    }
};
exports.claimHoot = claimHoot;
