import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { viteSingleFile } from "vite-plugin-singlefile";
import path from "node:path";

// Set SINGLEFILE=1 to emit one self-contained index.html (no server needed) —
// handy for sharing an offline, interactive preview.
const singleFile = process.env.SINGLEFILE === "1";
// GitHub Pages serves a project repo under /<repo>/ — set base accordingly.
const ghPages = process.env.GHPAGES === "1";

// Build stamp — shown in the app footer so "which version am I seeing?"
// is answerable in two seconds, on any device.
const buildId = new Date().toISOString().slice(0, 16).replace("T", " ") + " UTC";

export default defineConfig({
  define: { __BUILD_ID__: JSON.stringify(buildId) },
  base: ghPages ? "/Cosmic_Calendar/" : singleFile ? "./" : "/",
  plugins: [react(), ...(singleFile ? [viteSingleFile()] : [])],
  // inline all assets (incl. webp images) into the single HTML for offline preview
  build: singleFile ? { assetsInlineLimit: 100_000_000 } : {},
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      // The package's "module" field points at an unpublished src/ entry;
      // pin it to the built CJS bundle so Vite/Rollup can resolve it.
      "circular-natal-horoscope-js": path.resolve(__dirname, "./node_modules/circular-natal-horoscope-js/dist/index.js"),
    },
  },
});
