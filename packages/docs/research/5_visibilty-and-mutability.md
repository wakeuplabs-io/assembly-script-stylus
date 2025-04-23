# Stylus Contracts — Function Types, Gas Costs & Best Practices

## About

This project uses AssemblyScript with Stylus to build smart contracts on Arbitrum.  
Stylus does not enforce Solidity-like keywords (`view`, `pure`, `public`, `external`, etc.) at the VM level.  
However, following these conventions improves clarity and developer experience.

This document explains how to handle function types, gas costs, and ABI generation for Stylus contracts.

---

## Gas Costs & How to Call Functions

| Function Type     | Call Method           | Gas Cost | Purpose                              |
|------------------|------------------------|----------|--------------------------------------|
| Pure              | `eth_call`            | No gas   | Local computation, no storage access |
| View              | `eth_call`            | No gas   | Read-only, access to storage         |
| State-changing    | `eth_sendTransaction` | Gas      | Write to storage, emit logs          |

---

## Recommended Function Naming Convention

| Prefix       | Meaning         | Usage                 |
|--------------|-----------------|-----------------------|
| `getXXX`     | View function   | `eth_call`            |
| `setXXX`     | Mutating state  | `eth_sendTransaction` |
| `computeXXX` | Pure function   | `eth_call`            |

---

## AssemblyScript Example

```typescript
/// Pure function — safe for eth_call
export function computeSum(a: u64, b: u64): u64 {
  return a + b;
}

/// View function — safe for eth_call
export function getCounter(): u64 {
  return loadCounter();
}

/// Mutating function — must be called with eth_sendTransaction
export function setCounter(value: u64): void {
  storeCounter(value);
}
```

## ABI Generation

Stylus does not generate ABI automatically from AssemblyScript.

To interact properly with your contract:

- Write the ABI JSON.
- Mark `view` / `pure` functions correctly.
- Ensure state-changing functions require transactions.

---

## Final Notes

Stylus lets you call any exported function with `eth_call` — but writing to storage will fail if not using a transaction.

It's the developer's responsibility to document which functions mutate state.

Proper ABI design and naming conventions will help both human developers and automated tools.
