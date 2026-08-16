import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import mongoose from "mongoose";

import { connectMongoose } from "@/lib/mongoose";
import { StoreSettingsModel } from "@/modules/settings/model";
import { getAdminStoreSettings } from "@/modules/settings/repository";

describe("admin store settings defaults", () => {
  beforeAll(async () => {
    if (!process.env.MONGODB_URI) {
      process.env.MONGODB_URI = "mongodb://127.0.0.1:27017/afnan-test";
      process.env.MONGODB_DB_NAME = "afnan-test";
    }
    await connectMongoose();
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    await StoreSettingsModel.deleteMany({});
  });

  it("uses the current admin email only when settings have not been saved", async () => {
    const defaults = await getAdminStoreSettings("Owner@Example.com");
    expect(defaults.adminEmail).toBe("owner@example.com");

    await StoreSettingsModel.create({
      singletonKey: "STORE_SETTINGS",
      storeName: "Afnan",
      adminEmail: "operations@afnan.eg",
      adminWhatsappE164: "+201000000000",
      orderPrefix: "AFN",
      customRequestPrefix: "CR",
      whatsappOrderTemplate: "Hello {customerName}, confirm {orderNumber} totaling {total} for {deliveryArea}.",
      socialLinks: {},
    });

    const saved = await getAdminStoreSettings("another-admin@example.com");
    expect(saved.adminEmail).toBe("operations@afnan.eg");
  });
});
