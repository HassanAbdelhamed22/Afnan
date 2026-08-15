import { connectMongoose } from "../src/lib/mongoose";
import mongoose from "mongoose";
import { CategoryModel } from "../src/modules/categories/model";
import { ProductModel } from "../src/modules/products/model";
import { AddressModel } from "../src/modules/users/model";
import { CartModel } from "../src/modules/cart/model";
import { WishlistModel } from "../src/modules/wishlist/model";
import { OrderModel } from "../src/modules/orders/model";
import { ShippingRateModel } from "../src/modules/shipping/model";
import { CustomRequestModel } from "../src/modules/custom-requests/model";
import { UploadIntentModel } from "../src/modules/uploads/model";
import { StoreSettingsModel } from "../src/modules/settings/model";
import { assertProductionMaintenanceAllowed } from "./lib/production-guard";

const INDEX_SCHEMA_VERSION = "2026-08-member-3-v1";

async function main() {
  assertProductionMaintenanceAllowed("create-indexes");
  console.log("Connecting to database...");
  await connectMongoose();
  console.log("Creating database indexes...");

  await CategoryModel.ensureIndexes();
  console.log("Category indexes created.");

  await ProductModel.ensureIndexes();
  console.log("Product indexes created.");

  await AddressModel.ensureIndexes();
  console.log("Address indexes created.");

  await CartModel.ensureIndexes();
  console.log("Cart indexes created.");

  await WishlistModel.ensureIndexes();
  console.log("Wishlist indexes created.");

  await OrderModel.ensureIndexes();
  await ShippingRateModel.ensureIndexes();
  console.log("Order and shipping indexes created.");

  await CustomRequestModel.ensureIndexes();
  await UploadIntentModel.ensureIndexes();
  await StoreSettingsModel.ensureIndexes();
  console.log("Custom request, upload, and store settings indexes created.");

  await mongoose.connection.collection("_maintenance").updateOne(
    { key: "index-schema" },
    {
      $set: {
        version: INDEX_SCHEMA_VERSION,
        appliedAt: new Date(),
      },
    },
    { upsert: true },
  );

  console.log(`All indexes synchronized at ${INDEX_SCHEMA_VERSION}.`);
  process.exit(0);
}

main().catch((error) => {
  console.error("Index creation failed:", error);
  process.exit(1);
});
