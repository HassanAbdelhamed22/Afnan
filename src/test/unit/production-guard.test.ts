import { afterEach, describe, expect, it } from "vitest";

import {
  assertDestructiveSeedAllowed,
  assertProductionMaintenanceAllowed,
} from "../../../scripts/lib/production-guard";

const originalNodeEnvironment = process.env.NODE_ENV;
const originalVercelEnvironment = process.env.VERCEL_ENV;
const originalMaintenanceOverride = process.env.ALLOW_PRODUCTION_MAINTENANCE;
const originalSeedOverride = process.env.ALLOW_DESTRUCTIVE_SEED;

function restoreEnvironment(name: string, value: string | undefined) {
  if (value === undefined) {
    delete process.env[name];
  } else {
    process.env[name] = value;
  }
}

afterEach(() => {
  restoreEnvironment("NODE_ENV", originalNodeEnvironment);
  restoreEnvironment("VERCEL_ENV", originalVercelEnvironment);
  restoreEnvironment("ALLOW_PRODUCTION_MAINTENANCE", originalMaintenanceOverride);
  restoreEnvironment("ALLOW_DESTRUCTIVE_SEED", originalSeedOverride);
});

describe("maintenance script production guards", () => {
  it("requires an operation-specific production override", () => {
    process.env.VERCEL_ENV = "production";
    delete process.env.ALLOW_PRODUCTION_MAINTENANCE;

    expect(() => assertProductionMaintenanceAllowed("create-indexes")).toThrow(
      /Refusing to run create-indexes/,
    );

    process.env.ALLOW_PRODUCTION_MAINTENANCE = "create-indexes";
    expect(() => assertProductionMaintenanceAllowed("create-indexes")).not.toThrow();
  });

  it("requires the exact database name before destructive seeding", () => {
    process.env.VERCEL_ENV = "preview";
    process.env.ALLOW_DESTRUCTIVE_SEED = "another-database";

    expect(() => assertDestructiveSeedAllowed("afnan-test")).toThrow(
      /Refusing destructive seed/,
    );

    process.env.ALLOW_DESTRUCTIVE_SEED = "afnan-test";
    expect(() => assertDestructiveSeedAllowed("afnan-test")).not.toThrow();
  });
});
