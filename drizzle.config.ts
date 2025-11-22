import type { Config } from "drizzle-kit";
import { ENV } from "./_core/env";

export default {
  schema: "./schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  // @ts-ignore - Cloudflare D1 dialect config
  dbCredentials: {
    url: ENV.databaseUrl,
    ssl: "require",
  },
} as Config;

