import AlgodClient from 'algosdk/dist/types/src/client/v2/algod/algod';
import fs from 'fs';
import axios from 'axios';
import { Indexer } from 'algosdk';
import { Asset } from '../types/user';

const ipfsGateway = process.env.IPFS_GATEWAY || 'https://dweb.link/ipfs/';

export const asyncForEach = async (array: Array<any>, callback: any) => {
  for (let index = 0; index < array.length; index++) {
    try {
      await callback(array[index], index, array);
    } catch (error) {
      console.log('ERROR', error);
    }
  }
};

export const determineOwnership = async function (
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
      if (asset[`asset-id`] === Number(process.env.OPT_IN_ASSET_ID)) {
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
    console.log(error);
    throw new Error('error determening ownership');
  }
};

export const findAsset = async (assetId: number, indexer: Indexer) => {
  try {
    return await indexer.searchForAssets().index(assetId).do();
  } catch (error) {
    throw new Error('Error finding asset');
  }
};

export const downloadFile = async (
  asset: Asset,
  directory: string,
  username: string
): Promise<string | void> => {
  const { assetUrl } = asset;
  if (assetUrl) {
    const url = normalizeLink(assetUrl);
    console.log('url', url);
    const path = `${directory}/${username}.jpg`;
    const writer = fs.createWriteStream(path);
    const res = await axios.get(url, {
      responseType: 'stream',
    });
    res.data.pipe(writer);

    return new Promise((resolve, reject) => {
      writer.on('finish', () => {
        return resolve(path);
      });
      writer.on('error', reject);
    });
  } else {
    // error
  }
};

export const normalizeLink = (imageUrl: string) => {
  if (imageUrl?.slice(0, 4) === 'ipfs') {
    const ifpsHash = imageUrl.slice(7);
    console.log('IPFS GATEWAY', ipfsGateway);
    imageUrl = `${ipfsGateway}${ifpsHash}`;
  }
  return imageUrl;
};
