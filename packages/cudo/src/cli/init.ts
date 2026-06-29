import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const CONFIG_TEMPLATE = `import { defineConfig } from "cudo";

export default defineConfig({
  // include: ["Token", "Vault"],  // default: every contract with bytecode
  out: "./deployers",
  deploymentsPath: "./deployments",
  plugins: [],
});
`;

export interface InitResult {
  readonly configPath: string;
  readonly created: boolean;
}

/** Scaffold cudo.config.ts if absent. Does not install anything. */
export const runInit = (root: string): InitResult => {
  const configPath = join(root, "cudo.config.ts");
  const created = !existsSync(configPath);
  if (created) writeFileSync(configPath, CONFIG_TEMPLATE);
  return { configPath, created };
};

/** Whether `cudo` is a declared dependency of the project (not just present via npx). */
export const isCudoInstalled = (root: string): boolean => {
  const pkgPath = join(root, "package.json");
  if (!existsSync(pkgPath)) return false;
  const parsed: unknown = JSON.parse(readFileSync(pkgPath, "utf8"));
  const deps = parsed as { dependencies?: Record<string, string>; devDependencies?: Record<string, string> };
  return Boolean(deps.dependencies?.cudo ?? deps.devDependencies?.cudo);
};
