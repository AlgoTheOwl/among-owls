import Asset from '../models/asset'
import { normalizeIpfsUrl } from './helpers'
import fs from 'fs'
import axios from 'axios'

/**
 * Stores image fetched from url locally
 * @param asset
 * @param directory
 * @param username
 * @returns {string | void}
 */
export const downloadAssetImage = async (
  asset: Asset,
  directory: string,
  username: string
): Promise<string | void> => {
  try {
    const { assetUrl } = asset
    if (assetUrl) {
      const url = normalizeIpfsUrl(assetUrl) as string
      const path = `${directory}/${username
        .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, '')
        .trim()}.jpg`
      const writer = fs.createWriteStream(path)
      const res = await axios.get(url, {
        responseType: 'stream',
      })
      res.data.pipe(writer)

      return new Promise((resolve, reject) => {
        writer.on('finish', () => {
          return resolve(path)
        })
      })
    }
  } catch (error) {
    console.log('****** ERROR DOWNLOADING ASSET IMAGE ******', error)
  }
}

/**
 * Empties specified directory
 * @param dirPath
 * @returns {void}
 */
export const rmDir = (dirPath: string): void =>
  fs.rm(dirPath, { recursive: true }, () => {})
