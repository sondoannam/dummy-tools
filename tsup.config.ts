import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/cli.ts"],
  format: ["cjs"],
  clean: true,
  dts: true,
  shims: true,
  minify: true,
  banner: {
    js: "#!/usr/bin/env node",
  },
  sourcemap: true,
  noExternal: ["commander"],
});
