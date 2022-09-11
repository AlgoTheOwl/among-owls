import Player from '../models/player'

const ipfsGateway = process.env.IPFS_GATEWAY || 'https://dweb.link/ipfs/'

/**
 * Wait asycronously
 * @param duration
 */
export const wait = async (duration: number): Promise<void> => {
  await new Promise((res) => {
    setTimeout(res, duration)
  })
}

/**
 * Loop for async operations
 * @param array
 * @param callback
 */
export const asyncForEach = async (
  array: Array<any>,
  callback: Function
): Promise<void> => {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array)
  }
}

/**
 * Maps out entered players for embed fields
 * @param playerArr
 * @param type
 * @returns {{ name: string; value: string }[]}
 */
export const mapPlayersForEmbed = (
  playerArr: Player[],
  type: string
): { name: string; value: string }[] => {
  const fields = playerArr.map((player) => {
    let value
    if (player.dead || player.hp <= 0) {
      value = '💀'
    } else {
      value =
        type === 'game'
          ? `HP: ${player.hp}`
          : `${player.asset.alias || player.asset.assetName}`
    }
    return {
      name: player.username,
      value,
    }
  })
  return randomSort(fields)
}

/**
 * Returns readable number suffix
 * @param num
 * @returns {string}
 */
export const getNumberSuffix = (num: number): string => {
  if (num === 1) return '1st'
  if (num === 2) return '2nd'
  if (num === 3) return '3rd'
  else return `${num}th`
}

/**
 * Prooducs random number within range
 * @param min
 * @param max
 * @returns {number}
 */
export const randomNumber = (min: number, max: number): number =>
  Math.floor(Math.random() * (max - min) + min)

export const randomSort = (arr: any[]): any[] => {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * i)
    const k = arr[i]
    arr[i] = arr[j]
    arr[j] = k
  }
  return arr
}

/**
 * Determines if url is an IPFS locater
 * @param url
 * @returns
 */
export const isIpfs = (url: string): boolean => url?.slice(0, 4) === 'ipfs'

/**
 * Converst IPFS url to http url for consumption in game
 * @param url
 * @returns
 */
export const normalizeIpfsUrl = (url: string): string => {
  if (isIpfs(url)) {
    const ifpsHash = url.slice(7)
    return `${ipfsGateway}${ifpsHash}`
  } else {
    return url
  }
}
