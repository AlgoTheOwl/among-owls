// External Dependencies
import * as mongoDB from 'mongodb';

// Global Variables
export const collections: { users?: mongoDB.Collection } = {};

let db: mongoDB.Db;

// Initialize Connection
export async function connectToDatabase() {
  const client: mongoDB.MongoClient = new mongoDB.MongoClient(
    process.env.DB_CONN_STRING
  );

  await client.connect();

  db = client.db(process.env.DB_NAME);

  const usersCollection: mongoDB.Collection = db.collection(
    process.env.GAMES_COLLECTION_NAME
  );

  collections.users = usersCollection;

  console.log(
    `Successfully connected to database: ${db.databaseName} and collection: ${usersCollection.collectionName}`
  );
}

export { db };
