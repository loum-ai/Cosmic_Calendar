import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { viteSingleFile } from "vite-plugin-singlefile";
import path from "node:path";

// Set SINGLEFILE=1 to emit one self-contained index.html (no server needed) —
// handy for sharing an offline, interactive preview.
const singleFile = process.env.SINGLEFILE === "1";

export default defineConfig({
  base: singleFile ? "./" : "/",
  plugins: [react(), ...(singleFile ? [viteSingleFile()] : [])],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
