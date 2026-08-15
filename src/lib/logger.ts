type LogMetadata = Record<string, string | number | boolean | null | undefined>;

export const logger = {
  info: (message: string, metadata?: LogMetadata) => console.info(JSON.stringify({ level: "info", message, ...metadata })),
  error: (message: string, metadata?: LogMetadata) => console.error(JSON.stringify({ level: "error", message, ...metadata })),
  warn: (message: string, metadata?: LogMetadata) => console.warn(JSON.stringify({ level: "warn", message, ...metadata })),
};
