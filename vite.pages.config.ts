import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { readFile, rm, writeFile } from "node:fs/promises";

export default defineConfig({
  base: "./",
  publicDir: "public",
  plugins: [
    react(),
    {
      name: "flatten-pages-entry",
      async closeBundle() {
        const nested = "github-pages-dist/github-pages/index.html";
        const html = await readFile(nested, "utf8");
        await writeFile("github-pages-dist/index.html", html.replaceAll("../assets/", "assets/"), "utf8");
        await rm("github-pages-dist/github-pages", { recursive: true, force: true });
      },
    },
  ],
  build: {
    outDir: "github-pages-dist",
    emptyOutDir: true,
    rollupOptions: {
      input: "github-pages/index.html",
    },
  },
});

