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
    }
  }
}

export {}
