import { connectMongoose } from "../src/lib/mongoose";
import { CategoryModel } from "../src/modules/categories/model";
import { ProductModel } from "../src/modules/products/model";

async function main() {
  console.log("Connecting to database...");
  await connectMongoose();
  console.log("Creating database indexes...");

  await CategoryModel.ensureIndexes();
  console.log("Category indexes created.");

  await ProductModel.ensureIndexes();
  console.log("Product indexes created.");

  console.log("All indexes successfully synchronized.");
  process.exit(0);
}

main().catch((error) => {
  console.error("Index creation failed:", error);
  process.exit(1);
});
