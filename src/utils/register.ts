import { findPlayer, addPlayer } from '../services/operations';
import { Asset } from '../types/user';
import algosdk from 'algosdk';
import { determineOwnership, findAsset } from './helpers';

const algoNode: string = process.env.ALGO_NODE;
const pureStakeApi: string = process.env.PURESTAKE_API;
const algoIndexerNode: string = process.env.ALGO_INDEXER_NODE;
const optInAssetId: number = Number(process.env.OPT_IN_ASSET_ID);

const token = {
  'X-API-Key': pureStakeApi,
};
const server: string = algoNode;
const indexerServer: string = algoIndexerNode;
const port = '';

const processRegistration = async (
  user: any,
  address: string,
  assetId: number
): Promise<any> => {
  try {
    const algodClient = new algosdk.Algodv2(token, server, port);
    const algoIndexer = new algosdk.Indexer(token, indexerServer, port);
    const { id: discordId, username } = user;

    // Check if asset is owned and wallet has opt-in asset
    const { walletOwned, assetOwned } = await determineOwnership(
      algodClient,
      address,
      assetId
    );

    const isOwned = walletOwned && assetOwned;

    if (isOwned) {
      // If owned, find full player and asset data
      const player = await findPlayer(discordId);
      const asset = await findAsset(assetId, algoIndexer);

      const {
        name: assetName,
        url: assetUrl,
        'unit-name': unitName,
      } = asset?.assets[0].params;

      // Check if it's a Randy Cone
      if (unitName.slice(0, 5) !== 'RCONE') {
        return {
          status:
            'This asset is not a randy cone, please try again with a meltable NFT',
          asset: null,
          registeredUser: user,
        };
      }

      const assetEntry: Asset = {
        assetUrl,
        assetName,
        assetId: assetId,
        unitName,
      };

      if (!player) {
        // Player doesn't exist, add to db
        await addPlayer({
          discordId,
          username,
          address: address,
          asset: assetEntry,
        });
        return {
          status: `Added ${unitName} for melting - you can add up to 4 more assets`,
          asset: assetEntry,
          registeredUser: user,
        };
      } else {
        // you can only register once
      }
      // Either wallet isn't owned or asset is not owned by wallet
      const status = walletOwned
        ? `Looks like the wallet address entered doesn't hold this asset, please try again!`
        : `Looks like you haven't opted in to to asset ${optInAssetId}. Please opt in on Rand Gallery by using this link: https://www.randgallery.com/algo-collection/?address=${optInAssetId}`;
      return {
        status,
        asset: null,
        registeredUser: user,
      };
    }
  } catch (error) {
    return {
      status: 'Something went wrong during registration, please try again',
      asset: null,
      registeredUser: user,
    };
  }
};

export { processRegistration };
