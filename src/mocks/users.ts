import User from '../models/user'

export default [
  new User('user1', 'testid', 'testAddress', { assetId: 123456 }, 1000),
  new User('user2', 'testid', 'testAddress', { assetId: 123456 }, 1000),
  new User('user3', 'testid', 'testAddress', { assetId: 123456 }, 1000),
  new User('user4', 'testid', 'testAddress', { assetId: 123456 }, 1000),
  new User('user5', 'testid', 'testAddress', { assetId: 123456 }, 1000),
]

const instertedPlayer = {
  discordId: '717166398320672867',
  username: 'Algorandpa',
  address: '5PH4EVRJVWF3M6JRPQEA2HRXTSNH6NNGBNHBNFO7XD7JUVZRHC5CDMS47A',
  asset: {
    assetUrl:
      'ipfs://bafybeib6ulqljdqwki2dwhyjkkologteg5q4ecoaydzt2h6wl5ztm5wmvq',
    assetName: 'Wolf #98',
    assetId: 550344747,
    unitName: 'WOLF-98',
  },
}
