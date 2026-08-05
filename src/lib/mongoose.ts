import "server-only";

import mongoose, { type Mongoose } from "mongoose";

import { env } from "@/lib/env";

type MongooseCache = {
  connection: Mongoose | null;
  promise: Promise<Mongoose> | null;
};

const globalForMongoose = globalThis as unknown as {
  mongooseCache?: MongooseCache;
};

const cache =
  globalForMongoose.mongooseCache ??
  {
    connection: null,
    promise: null,
  };

globalForMongoose.mongooseCache = cache;

export async function connectMongoose(): Promise<Mongoose> {
  if (cache.connection) {
    return cache.connection;
  }

  cache.promise ??= mongoose.connect(env.MONGODB_URI, {
    dbName: env.MONGODB_DB_NAME,
    bufferCommands: false,
  });

  cache.connection = await cache.promise;

  return cache.connection;
}
