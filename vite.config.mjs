import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { cp, mkdir } from "node:fs/promises";
import { resolve } from "node:path";

const root = process.cwd();
const pages = ["index", "album", "new-album", "book", "april7", "birthday", "may8", "new-year", "valentine", "anniversary", "silence"];
const staticEntries = ["assets", "audio", "photos", "videos", "album-data.json", ".nojekyll"];

function copyStaticAssets() {
  return {
    name: "copy-static-assets",
    apply: "build",
    async closeBundle() {
      const output = resolve(root, "dist");
      await mkdir(output, { recursive: true });
      await Promise.all(staticEntries.map((entry) =>
        cp(resolve(root, entry), resolve(output, entry), { recursive: true, force: true })
      ));
    },
  };
}

export default defineConfig(({ mode }) => ({
  base: mode === "production" ? "/Arina/" : "/",
  plugins: [react(), copyStaticAssets()],
  build: {
    target: "es2020",
    cssCodeSplit: true,
    sourcemap: true,
    rollupOptions: {
      input: Object.fromEntries(pages.map((page) => [page, resolve(root, `${page}.html`)])),
      output: {
        assetFileNames: "assets/[name]-[hash][extname]",
        chunkFileNames: "assets/[name]-[hash].js",
        entryFileNames: "assets/[name]-[hash].js",
      },
    },
  },
}));
