import AlgodClient from 'algosdk/dist/types/src/client/v2/algod/algod';
import { Indexer } from 'algosdk';

const determineOwnership = async function (
  algodclient: AlgodClient,
  address: string,
  assetId: number
): Promise<any> {
  try {
    let accountInfo = await algodclient.accountInformation(address).do();
    let assetOwned = false;
    let walletOwned = false;
    accountInfo.assets.forEach((asset: any) => {
      // Check for opt-in asset
      if (asset[`asset-id`] === process.env.OPT_IN_ASSET_ID && !asset.amount) {
        walletOwned = true;
      }
      // Check for entered asset
      if (asset['asset-id'] === assetId) {
        assetOwned = true;
      }
    });
    return {
      assetOwned,
      walletOwned,
    };
  } catch (error) {
    throw new Error('error determening ownership');
  }
};

const findAsset = async (assetId: number, indexer: Indexer) => {
  try {
    return await indexer.searchForAssets().index(assetId).do();
  } catch (error) {
    throw new Error('Error finding asset');
  }
};

export { determineOwnership, findAsset };
