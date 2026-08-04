import "server-only";

import { MongoClient } from "mongodb";

import { env } from "@/lib/env";

const globalForMongo = globalThis as unknown as {
  authMongoClient?: MongoClient;
};

export const authMongoClient =
  globalForMongo.authMongoClient ??
  new MongoClient(env.MONGODB_URI);

if (env.NODE_ENV !== "production") {
  globalForMongo.authMongoClient = authMongoClient;
}

export const authDatabase = authMongoClient.db(
  env.MONGODB_DB_NAME,
);
