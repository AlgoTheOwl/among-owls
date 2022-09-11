// External Dependencies
import * as mongoDB from 'mongodb'

// Global Variables
export const collections: {
  [key: string]: mongoDB.Collection
} = {}

let db: mongoDB.Db

/**
 * Connects to mongoDb instance
 */
export async function connectToDatabase() {
  const client: mongoDB.MongoClient = new mongoDB.MongoClient(
    process.env.DB_CONN_STRING
  )

  await client.connect()

  db = client.db(process.env.DB_NAME)

  const usersCollection: mongoDB.Collection = db.collection(
    process.env.USERS_COLLECTION_NAME
  )

  const settingsCollections: mongoDB.Collection = db.collection(
    process.env.SETTINGS_COLLECTION_NAME
  )

  const encountersCollection: mongoDB.Collection = db.collection(
    process.env.ENCOUNTERS_COLLECTION_NAME
  )

  collections.users = usersCollection
  collections.settings = settingsCollections
  collections.encounters = encountersCollection

  console.log(`Successfully connected to database: ${db.databaseName}`)
}

export { db }
