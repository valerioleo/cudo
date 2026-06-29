<div align="center">

# cudo

**viem-first contract deployment — deploy once, use your contracts as typed objects.**

Works with Hardhat and Foundry.

</div>

---

`cudo` (Latin _cūdō_, "to forge / to mint") is a dev tool, like `@wagmi/cli` or Prisma: you run it, and the code it generates depends only on `viem` — never on `cudo`.

```bash
npx cudo init && npx cudo generate
```

```ts
// deploy once; every run after that returns the same contract
const token = await getOrDeployToken({ walletClient, publicClient, args: [owner] });
await token.write.transfer([to, amount]);
```

You get a single source of truth for every address, ABI, and chain — and contracts you can import as fully-typed viem objects, with no copied addresses, no stale ABIs, and no provider wiring. See [`packages/cudo`](packages/cudo) for the full guide.

## Packages

| Package                                      | Description                                                                                                                                                       |
| -------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [`cudo`](packages/cudo)                      | The deploy engine + codegen + CLI (`cudo generate` / `cudo init`). Reads Hardhat/Foundry artifacts, emits typed deployers, records each deploy to `deployments/`. |
| [`@cudo/wagmi`](packages/cudo-wagmi)         | A [`@wagmi/cli`](https://wagmi.sh/cli) plugin sourcing contracts from `deployments/` — typed contract objects for your app.                                       |
| [`@cudo/etherscan`](packages/cudo-etherscan) | Verify on Etherscan V2 (one key, all chains; also Blockscout/Routescan).                                                                                          |
| [`@cudo/sourcify`](packages/cudo-sourcify)   | Verify on Sourcify (v2, keyless).                                                                                                                                 |
| [`@cudo/slack`](packages/cudo-slack)         | Notify a Slack channel on each deploy.                                                                                                                            |

Plugins are deploy-lifecycle hooks authored against the `cudo/plugin` SDK; each ships as its own package.

## How it works

Two parts, with a plain `deployments/` folder as the contract between them:

```
artifacts (Hardhat artifacts/ or Foundry out/)
        │  Part 1 — cudo generate + your deploy script
        ▼
deployments/<network>/<Contract>.json   ← source of truth: address, abi, chainId, args, tx, compiler
        │  Part 2 — @wagmi/cli + @cudo/wagmi
        ▼
typed viem access / React hooks          ← you add a client; address + abi are already injected
```

`cudo` owns Part 1 (deploy + the `deployments/` record). Part 2 reuses `@wagmi/cli` — we don't reinvent codegen, we feed it.

## Development

```bash
pnpm install      # install everything
pnpm build        # build all packages (turbo)
pnpm test         # run all tests
pnpm typecheck    # typecheck all packages
pnpm lint         # oxlint
pnpm format       # prettier --write
```

This is a pnpm + Turborepo monorepo. Releases are managed with [Changesets](https://github.com/changesets/changesets): add one with `pnpm changeset`, and merging the resulting "Version Packages" PR publishes to npm with provenance.

## Status

Early. The deploy core, the plugin model, and the wagmi bridge are stabilizing. Hardhat v2 is supported today; a Hardhat v3 port will follow if adoption warrants it.

## License

[MIT](LICENSE) © Valerio Leo
