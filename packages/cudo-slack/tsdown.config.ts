import { defineConfig } from "tsdown";

// Dual ESM + CJS. `cudo` (the SDK, via `cudo/plugin`) is a peer — kept external so
// the plugin uses the consumer's cudo, never a bundled copy.
export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm", "cjs"],
  dts: true,
  clean: true,
  target: "node18",
  sourcemap: true,
});
