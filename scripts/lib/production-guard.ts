export function assertProductionMaintenanceAllowed(operation: string) {
  const isProduction =
    process.env.NODE_ENV === "production" || process.env.VERCEL_ENV === "production";

  if (isProduction && process.env.ALLOW_PRODUCTION_MAINTENANCE !== operation) {
    throw new Error(
      `Refusing to run ${operation} in production. Set ALLOW_PRODUCTION_MAINTENANCE=${operation} for this invocation only.`,
    );
  }
}

export function assertDestructiveSeedAllowed(databaseName: string) {
  assertProductionMaintenanceAllowed("seed");

  if (process.env.ALLOW_DESTRUCTIVE_SEED !== databaseName) {
    throw new Error(
      `Refusing destructive seed. Set ALLOW_DESTRUCTIVE_SEED=${databaseName} for this invocation only.`,
    );
  }
}
