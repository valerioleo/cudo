import { describe, it, expect } from "vitest";
import { createTestClients } from "../src/index";

describe("createTestClients", () => {
  it("exposes a prefunded, ready in-memory EVM as viem clients", async () => {
    const { account, chain, walletClient, publicClient } = await createTestClients();

    expect(account.address).toMatch(/^0x[0-9a-fA-F]{40}$/);
    expect(chain.id).toBeGreaterThan(0);
    expect(walletClient.account?.address).toBe(account.address);

    // it's a real, ready EVM: the account is prefunded and blocks advance
    const balance = await publicClient.getBalance({ address: account.address });
    expect(balance).toBeGreaterThan(0n);
    expect(await publicClient.getBlockNumber()).toBeGreaterThanOrEqual(0n);
  });

  it("exposes multiple prefunded accounts + a wallet-client factory for multi-party tests", async () => {
    const { accounts, walletClientFor, publicClient } = await createTestClients();
    expect(accounts.length).toBeGreaterThanOrEqual(2);

    const owner = accounts[0];
    const other = accounts[1];
    if (owner === undefined || other === undefined) throw new Error("need >= 2 prefunded accounts");

    const ownerWallet = walletClientFor(owner);
    const otherWallet = walletClientFor(other);

    // distinct signers on the same chain, both prefunded
    expect(ownerWallet.account?.address).toBe(owner.address);
    expect(otherWallet.account?.address).toBe(other.address);
    expect(otherWallet.account?.address).not.toBe(ownerWallet.account?.address);
    expect(await publicClient.getBalance({ address: other.address })).toBeGreaterThan(0n);
  });

  it("passes tevm options through (miningConfig override still boots)", async () => {
    const { account, publicClient } = await createTestClients({ miningConfig: { type: "auto" } });
    expect(await publicClient.getBalance({ address: account.address })).toBeGreaterThan(0n);
  });

  it("provides a fresh in-memory store so deploys never touch disk", async () => {
    const { store } = await createTestClients();
    expect(await store.read("anynet", "Anything")).toBeNull();
    expect(await store.list("anynet")).toEqual([]);
  });
});
