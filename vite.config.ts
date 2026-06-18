import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { viteSingleFile } from "vite-plugin-singlefile";
import path from "node:path";

// Set SINGLEFILE=1 to emit one self-contained index.html (no server needed) —
// handy for sharing an offline, interactive preview.
const singleFile = process.env.SINGLEFILE === "1";
// GitHub Pages serves a project repo under /<repo>/ — set base accordingly.
const ghPages = process.env.GHPAGES === "1";

export default defineConfig({
  base: ghPages ? "/Cosmic_Calendar/" : singleFile ? "./" : "/",
  plugins: [react(), ...(singleFile ? [viteSingleFile()] : [])],
  // inline all assets (incl. webp images) into the single HTML for offline preview
  build: singleFile ? { assetsInlineLimit: 100_000_000 } : {},
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
