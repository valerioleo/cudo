// The stable plugin-authoring surface, published under the `cudo/plugin` subpath
// so plugin packages (e.g. @cudo/etherscan) import a small, stable SDK instead of
// the whole engine. They peer-depend on `cudo` and import only from here. (This
// may graduate to a standalone @cudo/plugin package at extraction; the import
// path is the only thing that would change.)
export { definePlugin } from "./plugin";
export type {
  DeployPlugin,
  DeployedContext,
  PluginDeps,
  Awaitable,
  AnyDeployPlugin,
  PluginOverrides,
} from "./plugin";
export type { DeploymentRecord, ContractMetadata } from "./schemas";
