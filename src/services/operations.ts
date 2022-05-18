import { connectToDatabase, db } from './database.service';
import { Collection } from 'mongodb';
import User from '../models/user';

const addPlayer = async (playerData: User) => {
  const collection: Collection = db.collection('users');
  return await collection.insertOne(playerData);
};

const deletePlayer = async (playerData: User) => {
  const collection: Collection = db.collection('users');
  return await collection.deleteOne(playerData);
};

const findPlayer = async (discordId: string) => {
  const collection: Collection = db.collection('users');
  return await collection.findOne({ discordId });
};
export { addPlayer, deletePlayer, findPlayer };
