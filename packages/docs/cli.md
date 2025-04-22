
# Stylus CLI & SDK Summary

## CLI Commands Overview

#### Core

- `new` – Create a new Stylus project
- `init` – Initialize project in current directory
- `export-abi` – Export Solidity ABI
- `check` (`c`) – Check a contract
- `deploy` (`d`) – Deploy a contract
- `verify` (`v`) – Verify a deployed contract
- `help` – Show command help

#### Advanced

- `constructor` – Show constructor signature
- `activate` (`a`) – Activate deployed contract
- `cache` – Use Stylus CacheManager
- `cgen` – Generate C code bindings
- `replay` (`r`) – Replay transaction in GDB
- `trace` (`t`) – Trace a transaction
- `simulate` (`s`) – Simulate a transaction

---

### Stylus CLI Commands

#### Core Commands

| Command         | Description                                                                 |
|-----------------|-----------------------------------------------------------------------------|
| `new`           | Create a new Stylus project                                                 |
| `init`          | Initializes a Stylus project in the current directory                       |
| `export-abi`    | Export a Solidity ABI                                                       |
| `check` (`c`)   | Check a contract for errors or issues                                       |
| `deploy` (`d`)  | Deploy a contract                                                           |
| `verify` (`v`)  | Verify the deployment of a Stylus contract                                  |
| `help`          | Print the help message for available commands or specific subcommands       |

#### Advanced Commands

| Command             | Description                                                                 |
|---------------------|-----------------------------------------------------------------------------|
| `constructor`       | Print the signature of the constructor                                      |
| `activate` (`a`)    | Activate an already deployed contract                                       |
| `cache`             | Cache a contract using the Stylus CacheManager for Arbitrum chains          |
| `cgen`              | Generate C code bindings for a Stylus contract                              |
| `replay` (`r`)      | Replay a transaction in GDB                                                 |
| `trace` (`t`)       | Trace a transaction                                                         |
| `simulate` (`s`)    | Simulate a transaction                                                      |

---

## Stylus Contract Deployment on Arbitrum Sepolia

This document outlines the process for deploying a WebAssembly (WASM) contract using Stylus on the Arbitrum Sepolia network.

---

### Command Used

```bash
cargo stylus deploy   --wasm-file=stylus_hello_world.wasm   --private-key=0xc3349073d08058714ae5ac442e340cbaf20cad87cf050fc8a34842d3bdd90378   --endpoint=https://sepolia-rollup.arbitrum.io/rpc
```

> ⚠️ *Note: This command runs inside a Docker container for reproducibility. It might take a few minutes to complete.*

---

### Command Output

```text
Running in a Docker container for reproducibility, this may take a while
NOTE: You can opt out by doing --no-verify
Running reproducible Stylus command with toolchain 1.81.0
WARNING: The requested image’s platform (linux/amd64) does not match the detected host platform (linux/arm64/v8) and no specific platform was requested
stripped custom section from user wasm to remove any sensitive data
contract size: 6.8 KB (6805 bytes)
wasm data fee: 0.000073 ETH (originally 0.000061 ETH with 20% bump)
deployed code at address: 0x48657853bf9d64ea93bb9cfc1568cbf389cca271
deployment tx hash: 0xb3bf5fc4b766a95d68b7c3855f5adba1f207cf338e3214aa75a736942b5dd674
contract activated and ready onchain with tx hash: 0x5908687a96339b9e6b227a0c509277b547887df60d3ee9e7ad71172a30fef169
```

---

### Deployment Details

- **WASM File**: `stylus_hello_world.wasm`
- **Contract Size**: 6.8 KB (6805 bytes)
- **WASM Data Fee**: `0.000073 ETH` (with a 20% bump)
- **Deployed Contract Address**: `0x48657853bf9d64ea93bb9cfc1568cbf389cca271`
- **Deployment Transaction Hash**: `0xb3bf5fc4b766a95d68b7c3855f5adba1f207cf338e3214aa75a736942b5dd674`
- **On-chain Activation Transaction Hash**: `0x5908687a96339b9e6b227a0c509277b547887df60d3ee9e7ad71172a30fef169`

---

### Notes

- The deployment was performed using the `cargo stylus` tool inside a Docker container running Rust toolchain `1.81.0`.
- The contract was successfully activated on the Arbitrum Sepolia network.
- The `--private-key` used for signing the transaction should be kept secure and never shared.

---

### Resources

- [Arbitrum Sepolia RPC Endpoint](https://sepolia-rollup.arbitrum.io/rpc)
- [Stylus Documentation](https://developer.arbitrum.io/stylus)

### Verification

To verify the deployed contract on the Arbitrum Sepolia network, run the following command:

```bash
cargo stylus verify   --deployment-tx=0xb3bf5fc4b766a95d68b7c3855f5adba1f207cf338e3214aa75a736942b5dd674   --endpoint=https://sepolia-rollup.arbitrum.io/rpc
```

> ✅ This step confirms the contract's integrity and ensures it was correctly deployed on-chain.
