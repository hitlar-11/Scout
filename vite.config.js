import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [
    {
      name: "catch-malformed-urls",
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          const url = req.url || "";
          try {
            decodeURI(url);
          } catch (err) {
            console.error("[vite] Malformed request URL detected:", url);
            res.statusCode = 400;
            res.end("Malformed request URL");
            return;
          }
          next();
        });
      },
    },
    react(),
  ],

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./"), // ✔ أهم سطر — يصلح كل الأخطاء
    },
  },

  optimizeDeps: {
    exclude: ["postgres", "drizzle-orm"],
  },

  ssr: {
    noExternal: ["postgres", "drizzle-orm"],
  },

  server: {
    fs: {
      strict: false,
    },
  },
});
