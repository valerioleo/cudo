#!/usr/bin/env node
import { resolve, join } from "node:path";
import { existsSync } from "node:fs";
import { createJiti } from "jiti";
import { runGenerate } from "./cli/generate";
import { runInit, isCudoInstalled } from "./cli/init";
import type { Config } from "./config";

const CONFIG_NAMES = ["cudo.config.ts", "cudo.config.js", "cudo.config.mjs"];
const fail = (message: string): never => {
  console.error(`cudo: ${message}`);
  process.exit(1);
};

const generate = async (root: string): Promise<void> => {
  if (!isCudoInstalled(root)) {
    fail(
      "`cudo` is not in your package.json — generated deployers import it.\n  Add it with `pnpm add -D cudo`, or run `npx cudo init`.",
    );
  }
  const configPath = CONFIG_NAMES.map((name) => join(root, name)).find((p) => existsSync(p));
  if (configPath === undefined) return fail("no cudo.config found. Run `npx cudo init` first.");

  const config = (await createJiti(import.meta.url).import(configPath, { default: true })) as Config;
  const out = resolve(root, config.out ?? "./deployers");
  const files = runGenerate({ root, out, configPath, include: config.include });
  console.log(`cudo: generated ${files.length} file(s) → ${out}`);
};

const init = (root: string): void => {
  const { configPath, created } = runInit(root);
  console.log(created ? `cudo: created ${configPath}` : `cudo: ${configPath} already exists`);
  if (!isCudoInstalled(root)) console.log("  next: add cudo as a dev dependency → `pnpm add -D cudo`");
};

const main = async (): Promise<void> => {
  const root = process.cwd();
  const command = process.argv[2];
  if (command === "generate") return generate(root);
  if (command === "init") return init(root);
  console.log("usage: cudo <generate|init>");
};

main().catch((error: unknown) => fail(error instanceof Error ? error.message : String(error)));
