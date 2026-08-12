import fs from "fs";
import path from "path";
import mongoose from "mongoose";
import { egyptGovernorates } from "../src/config/egypt-governorates";

function loadLocalEnvironment() {
  for (const filename of [".env.local", ".env"]) {
    const envPath = path.resolve(process.cwd(), filename);
    if (!fs.existsSync(envPath)) continue;
    for (const line of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const separator = trimmed.indexOf("=");
      if (separator < 1) continue;
      const key = trimmed.slice(0, separator).trim();
      const value = trimmed.slice(separator + 1).trim();
      process.env[key] ??= value;
    }
  }
}

async function main() {
  loadLocalEnvironment();
  if (!process.env.MONGODB_URI) throw new Error("MONGODB_URI is required");
  await mongoose.connect(process.env.MONGODB_URI, {
    dbName: process.env.MONGODB_DB_NAME || "afnan",
  });
  const rates = mongoose.connection.collection("shippingrates");
  for (const rate of egyptGovernorates) {
    await rates.updateOne(
      { governorateCode: rate.code },
      {
        $setOnInsert: {
          governorateCode: rate.code,
          governorateName: rate.name,
          feeAmount: rate.shippingFee,
          minDeliveryDays: rate.minDeliveryDays,
          maxDeliveryDays: rate.maxDeliveryDays,
          isActive: rate.active,
        },
      },
      { upsert: true },
    );
  }
  console.log("Default shipping rates are available.");
  await mongoose.disconnect();
}

main().catch((error) => {
  console.error("Shipping-rate setup failed:", error);
  void mongoose.disconnect();
  process.exit(1);
});
