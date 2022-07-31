declare global {
  namespace NodeJS {
    interface ProcessEnv {
      MONGO_URI: string
      DISCORD_TOKEN: string
      DISCORD_CLIENT_ID: string
      DISCORD_GUILD_ID: string
      ALGO_NODE: string
      ALGO_INDEXER_NODE: string
      PURESTAKE_API: string
      OPT_IN_ASSET_ID: string
      DB_CONN_STRING: string
      USERS_COLLECTION_NAME: string
      ASSETS_COLLECTION_NAME: string
      GAME_COLLECTION_NAME: string
      UNIT_NAME: string
      IPFS_GATEWAY: string
      ADMIN_ID: string
      REGISTERED_ID: string
      HOOT_WALLET_ADDRESS: string
      HOOT_CLAWBACK_ADDRESS: string
      HOOT_SOURCE_MNEMONIC: string
      CREATOR_ADDRESS_ONE: string
      CREATOR_ADDRESS_TWO: string
      CREATOR_ADDRESS_THREE: string
      CHANNEL_ID: string
    }
  }
}

export {}
