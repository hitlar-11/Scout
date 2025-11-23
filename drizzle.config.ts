<<<<<<< HEAD
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

=======
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

>>>>>>> b0b1d46beaedb59dde9424453eb84a08aabfc3a8
