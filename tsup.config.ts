import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    "cli": "src/cli.ts",
    "index": "src/index.ts"
  },
  format: ["cjs"],
  clean: true,
  dts: true,
  shims: true,
  minify: true,
  // Remove the banner since we already have the shebang in cli.ts
  sourcemap: true,
  noExternal: ["commander"],
  treeshake: true,
  // Change the file output to fit npm package expectations
  outDir: "dist",
});
