# Stylus SDK Feature Comparison: Rust vs C/C++

Stylus enables smart contract development in WebAssembly-compatible languages. Currently, the best-supported SDK is in **Rust**, while **C/C++** is available with lower-level primitives.

This document compares the feature sets of both SDKs.

---

## 🧩 Feature Comparison Table

| **Feature**                             | **Rust SDK** 🦀                                         | **C/C++ SDK** 💻                                         |
|-----------------------------------------|--------------------------------------------------------|----------------------------------------------------------|
| **Entrypoint declaration**              | ✔️ With `#[entry]` macro                               | ❌ Manual `extern "C"` export                            |
| **Storage access**                      | ✔️ `#[storage_read]`, `#[storage_write]` macros        | ❌ Manual via `__stylus_read` / `__stylus_write`         |
| **Typed storage**                       | ✔️ Automatic via `serde`                               | ❌ Manual serialization logic                            |
| **Complex types (Vec, Map, structs)**   | ✔️ Works with `no_std` and `serde`                     | ❌ You need to build your own with raw pointers          |
| **Error handling**                      | ✔️ Idiomatic (`Result`, `Option`)                      | ❌ Basic: no error propagation, return codes only        |
| **Logging support**                     | ✔️ Logging macros (`log!`)                             | ❌ Manual with `__stylus_log`                            |
| **Event emission**                      | ✔️ With `emit!` macro or helpers                       | ❌ Manual with `__stylus_event`                          |
| **Argument deserialization**           | ✔️ Automatic in `#[entry]` using `serde`               | ❌ Manual memory reading and parsing                     |
| **External dependency support**         | ✔️ Any `no_std` and `wasm32`-compatible crates         | ❌ Must compile everything manually, often without `malloc` |
| **Local testing support**               | ✔️ Stylus test framework via `scarb test`              | ❌ Very limited; manual testing only                     |
| **Helper macros (`#[entry]`, `#[view]`)** | ✔️ Rich set of macros                                  | ❌ Not available                                         |
| **Solidity interoperability (ABI)**     | ✔️ `ethabi` and helpers for encoding/decoding          | ❌ Manual byte manipulation                              |
| **Documentation and examples**          | ✔️ Actively maintained and growing                     | ❌ Sparse or non-existent                                |

---

## 🔍 Summary

- **Rust SDK** is the most mature and developer-friendly option with high-level abstractions and great tooling.
- **C/C++ SDK** is functional but very low-level. It gives full control but lacks ergonomic features, safety, and documentation.

