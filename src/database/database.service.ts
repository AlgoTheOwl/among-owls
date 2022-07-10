// External Dependencies
import * as mongoDB from 'mongodb'

// Global Variables
export const collections: {
  // users?: mongoDB.Collection
  // assets?: mongoDB.Collection
  // yaoPlayers?: mongoDB.Collection
  [key: string]: mongoDB.Collection
} = {}

let db: mongoDB.Db

// Initialize Connection
export async function connectToDatabase() {
  const client: mongoDB.MongoClient = new mongoDB.MongoClient(
    process.env.DB_CONN_STRING
  )

  await client.connect()

  db = client.db(process.env.DB_NAME)

  const usersCollection: mongoDB.Collection = db.collection(
    process.env.USERS_COLLECTION_NAME
  )

  // const assetsCollection: mongoDB.Collection = db.collection(
  //   process.env.ASSETS_COLLECTION_NAME
  // )

  // const yaoPlayersCollection: mongoDB.Collection = db.collection(
  //   process.env.GAME_COLLECTION_NAME
  // )

  collections.users = usersCollection
  // collections.assets = assetsCollection
  // collections.yaoPlayers = yaoPlayersCollection

  console.log(`Successfully connected to database: ${db.databaseName}`)
}

export { db }
