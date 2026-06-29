import { describe, it, expect } from "vitest";
import { mkdtempSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { runGenerate } from "../../src/cli/generate";
import { runInit, isCudoInstalled } from "../../src/cli/init";

const hhRoot = join(import.meta.dirname, "..", "fixtures", "hh");

describe("runGenerate", () => {
  it("reads a project's artifacts and emits a deployer per deployable contract", () => {
    const project = mkdtempSync(join(tmpdir(), "cudo-gen-"));
    const out = join(project, "deployers");
    const files = runGenerate({ root: hhRoot, out, configPath: join(project, "cudo.config.ts") });

    expect(existsSync(join(out, "Counter.ts"))).toBe(true); // deployer
    expect(existsSync(join(out, "types", "Counter.ts"))).toBe(true); // artifact module
    expect(existsSync(join(out, "ICounter.ts"))).toBe(false); // interface skipped
    expect(files.length).toBeGreaterThan(0);

    const deployer = readFileSync(join(out, "Counter.ts"), "utf8");
    expect(deployer).toContain("export const getOrDeployCounter = defineDeployer(counterArtifact, config)");
    expect(deployer).toContain('import config from "../cudo.config"'); // deployers/ → ../cudo.config
  });

  it("honors an include filter", () => {
    const project = mkdtempSync(join(tmpdir(), "cudo-gen-"));
    const out = join(project, "deployers");
    runGenerate({ root: hhRoot, out, configPath: join(project, "cudo.config.ts"), include: ["Nope"] });
    expect(existsSync(join(out, "Counter.ts"))).toBe(false);
  });
});

describe("runInit + isCudoInstalled", () => {
  it("scaffolds cudo.config.ts when absent", () => {
    const root = mkdtempSync(join(tmpdir(), "cudo-init-"));
    const first = runInit(root);
    expect(first.created).toBe(true);
    expect(readFileSync(first.configPath, "utf8")).toContain("defineConfig");
    expect(runInit(root).created).toBe(false); // idempotent
  });

  it("detects whether cudo is a declared dependency", () => {
    const root = mkdtempSync(join(tmpdir(), "cudo-dep-"));
    writeFileSync(join(root, "package.json"), JSON.stringify({ devDependencies: { cudo: "^0.0.0" } }));
    expect(isCudoInstalled(root)).toBe(true);

    const bare = mkdtempSync(join(tmpdir(), "cudo-dep-"));
    writeFileSync(join(bare, "package.json"), JSON.stringify({ devDependencies: {} }));
    expect(isCudoInstalled(bare)).toBe(false);
  });
});
