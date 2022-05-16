// import {
//   Asset,
//   RegistrationResult,
//   WalletAsset,
//   User,
//   VerificationResult,
// } from './types';
// import algosdk, { Indexer } from 'algosdk';
// import AlgodClient from 'algosdk/dist/types/src/client/v2/algod/algod';
// import { addPlayer, findPlayer, addPlayerAsset } from './database';

// const algoNode: string = process.env.ALGO_NODE;
// const pureStakeApi: string = process.env.PURESTAKE_API;
// const algoIndexerNode: string = process.env.ALGO_INDEXER_NODE;
// const optInAssetId: number = Number(process.env.OPT_IN_ASSET_ID);

// const token = {
//   'X-API-Key': pureStakeApi,
// };
// const server: string = algoNode;
// const indexerServer: string = algoIndexerNode;
// const port = '';

// const processRegistration = async (
//   user: User,
//   address: string,
//   assetId: number
// ): Promise<RegistrationResult> => {
//   try {
//     const algodClient = new algosdk.Algodv2(token, server, port);
//     const algoIndexer = new algosdk.Indexer(token, indexerServer, port);
//     const { id: discordId, username } = user;

//     // Check if asset is owned and wallet has opt-in asset
//     const { walletOwned, assetOwned }: VerificationResult =
//       await determineOwnership(algodClient, address, assetId);

//     const isOwned = walletOwned && assetOwned;

//     if (isOwned) {
//       // If owned, find full player and asset data
//       const player = await findPlayer(discordId);
//       const asset = await findAsset(assetId, algoIndexer);

//       const {
//         name: assetName,
//         url: assetUrl,
//         'unit-name': unitName,
//       } = asset?.assets[0].params;

//       // Check if it's a Randy Cone
//       if (unitName.slice(0, 5) !== 'RCONE') {
//         return {
//           status:
//             'This asset is not a randy cone, please try again with a meltable NFT',
//           asset: null,
//           registeredUser: user,
//         };
//       }

//       const assetEntry: Asset = {
//         assetUrl,
//         assetName,
//         assetId: assetId,
//         unitName,
//       };

//       if (player) {
//         const assetCount = player.assets.length + 1;
//         if (assetCount >= 5) {
//           return {
//             status: `You've added 5 or more assets already`,
//             asset: null,
//             registeredUser: user,
//           };
//         }
//         await addPlayerAsset(discordId, assetEntry);
//         return {
//           status: `Added ${unitName} for melting - this asset number ${assetCount} out of 5`,
//           asset: assetEntry,
//           registeredUser: user,
//         };
//       }
//       // Player doesn't exist, add to db
//       await addPlayer({
//         discordId,
//         username,
//         address: address,
//         assets: [assetEntry],
//       });
//       return {
//         status: `Added ${unitName} for melting - you can add up to 4 more assets`,
//         asset: assetEntry,
//         registeredUser: user,
//       };
//     }
//     // Either wallet isn't owned or asset is not owned by wallet
//     const status = walletOwned
//       ? `Looks like the wallet address entered doesn't hold this asset, please try again!`
//       : `Looks like you haven't opted in to to asset ${optInAssetId}. Please opt in on Rand Gallery by using this link: https://www.randgallery.com/algo-collection/?address=${optInAssetId}`;
//     return {
//       status,
//       asset: null,
//       registeredUser: user,
//     };
//   } catch (error) {
//     return {
//       status: 'Something went wrong during registration, please try again',
//       asset: null,
//       registeredUser: user,
//     };
//   }
// };

// const findAsset = async (assetId: number, indexer: Indexer) => {
//   try {
//     return await indexer.searchForAssets().index(assetId).do();
//   } catch (error) {
//     throw new Error('Error finding asset');
//   }
// };

// const determineOwnership = async function (
//   algodclient: AlgodClient,
//   address: string,
//   assetId: number
// ): Promise<VerificationResult> {
//   try {
//     let accountInfo = await algodclient.accountInformation(address).do();
//     let assetOwned = false;
//     let walletOwned = false;
//     accountInfo.assets.forEach((asset: WalletAsset) => {
//       // Check for opt-in asset
//       if (asset[`asset-id`] === optInAssetId && !asset.amount) {
//         walletOwned = true;
//       }
//       // Check for entered asset
//       if (asset['asset-id'] === assetId) {
//         assetOwned = true;
//       }
//     });
//     return {
//       assetOwned,
//       walletOwned,
//     };
//   } catch (error) {
//     throw new Error('error determening ownership');
//   }
// };

// export { processRegistration };
