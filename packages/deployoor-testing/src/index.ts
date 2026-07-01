import { createMemoryClient, PREFUNDED_ACCOUNTS } from "tevm";
import { createWalletClient, createPublicClient, custom } from "viem";
import type { Account, Chain, PublicClient, WalletClient } from "viem";
import { memoryStore, type StoreAdapter } from "deployoor";

/**
 * Options for the in-memory EVM, passed straight through to tevm's `createMemoryClient`
 * (e.g. `fork`, `miningConfig`, `common`, `loggingLevel`). Mining defaults to `"auto"`
 * unless you override it here.
 */
export type CreateTestClientsOptions = Parameters<typeof createMemoryClient>[0];

/** Viem clients backed by a single in-memory EVM. Pass straight to a generated deployer. */
export interface TestClients {
  /** The primary prefunded account (`accounts[0]`), bound to `walletClient`. */
  readonly account: Account;
  /** Every prefunded account — use these to test multiple addresses interacting. */
  readonly accounts: readonly Account[];
  /** The in-memory chain — its name is what keys the `deployments/` records. */
  readonly chain: Chain;
  /** Wallet client bound to `account` (the first prefunded account). */
  readonly walletClient: WalletClient;
  readonly publicClient: PublicClient;
  /**
   * Build a wallet client bound to any account (another prefunded one, or your own
   * funded account) on the SAME in-memory EVM — for multi-party tests:
   * `const alice = walletClientFor(accounts[1])`.
   */
  readonly walletClientFor: (account: Account) => WalletClient;
  /**
   * A fresh **in-memory** deployment store. Spread it into deploy calls
   * (`getOrDeployToken({ ...clients, args })`) so deploys never touch disk and vanish
   * with the test — no stale `deployments/` files, no cross-run reuse.
   */
  readonly store: StoreAdapter;
}

/**
 * Spin up a real EVM ([tevm](https://tevm.sh)) in-process and expose it as ordinary
 * viem wallet/public clients — no `hardhat node`, no anvil, no RPC. Hand the clients
 * straight to a generated deployer:
 *
 * ```ts
 * const clients = await createTestClients();
 * // spread `clients` so deploys use the in-memory `store` — nothing hits disk
 * const token = await getOrDeployToken({ ...clients, args: [owner] });
 * ```
 *
 * Deploys go to an in-memory `store` that's discarded when the test ends (no
 * `deployments/` files, no cross-run reuse). For multiple interacting addresses use
 * `accounts` + `walletClientFor`; pass tevm options (fork, mining, …) via the argument.
 *
 * The return type is annotated with viem's portable client types on purpose: the
 * inferred tevm chain type pulls in `@ethereumjs/common`, which isn't nameable across
 * the package boundary under `declaration: true` (TS2742).
 */
export const createTestClients = async (options?: CreateTestClientsOptions): Promise<TestClients> => {
  // Default to auto-mining, but let the caller override anything (incl. miningConfig).
  const memory = createMemoryClient({ miningConfig: { type: "auto" }, ...options });
  await memory.tevmReady();
  const { chain } = memory;
  // retryCount: 0 — surface reverts immediately instead of viem's retry backoff.
  const transport = custom(memory, { retryCount: 0 });

  const walletClientFor = (account: Account): WalletClient =>
    createWalletClient({ account, chain, transport });

  const accounts: readonly Account[] = PREFUNDED_ACCOUNTS;
  const account = accounts[0];
  if (account === undefined) throw new Error("tevm exposed no prefunded accounts");

  return {
    account,
    accounts,
    chain,
    walletClient: walletClientFor(account),
    publicClient: createPublicClient({ chain, transport }),
    walletClientFor,
    store: memoryStore(),
  };
};
