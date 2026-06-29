import { defineConfig } from "tsdown";

// Dual ESM + CJS. cudo (via cudo/plugin) is a peer — kept external.
export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm", "cjs"],
  dts: true,
  clean: true,
  target: "node18",
  sourcemap: true,
});
