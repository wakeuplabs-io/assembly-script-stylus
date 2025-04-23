# 🔧 Writing WASM Modules for Stylus Using vm_hooks

This document provides an overview of how to build WebAssembly (WASM) contracts compatible with [Arbitrum Stylus](https://docs.arbitrum.io/stylus/), focusing on the correct use of `vm_hooks`, `user_entrypoint`, and host-provided functions.

---

## 🧠 What Are `vm_hooks`?

`vm_hooks` are **host functions provided by the Stylus VM**. These functions are not defined in your contract — instead, Stylus injects them when your contract is executed inside the Arbitrum chain.

These hooks expose low-level operations such as:

- Reading calldata (`read_args`)
- Writing return values (`write_result`)
- Reading the transaction value (`msg_value`)
- Reading/writing storage (`storage_load_bytes32`, `storage_cache_bytes32`)

### 🔗 They appear in your `.wat` as imports:

```wat
(import "vm_hooks" "read_args" (func ...))
(import "vm_hooks" "write_result" (func ...))
```

These functions must be declared as `extern` in Rust or `@external` in AssemblyScript, but **you never define them** — the host (Stylus VM) does.

---

## 🚪 The `user_entrypoint` Export

Stylus contracts **must export a single function named `user_entrypoint`**.

This function is the **entrypoint** through which Stylus invokes your contract logic. Internally, it is responsible for:

- Reading calldata using `read_args`
- Decoding the method selector
- Dispatching to the corresponding internal function
- Writing the result using `write_result`

### ✅ Example `.wat` snippet:

```wat
(export "user_entrypoint" (func $12))
```

You should **not export your business logic directly** (e.g. `set_number`, `get_number`). Instead, wrap all logic behind `user_entrypoint`.

---

## 🌍 Language-Agnostic Design

This architecture allows you to write contracts in **any language that can compile to WASM**, as long as:

- You declare `vm_hooks` as imported functions
- You export `user_entrypoint` as the only visible entry
- Your memory and execution model follow Stylus expectations

For example:

| Language        | VM Hook Declaration Syntax              |
|-----------------|------------------------------------------|
| Rust            | `extern "C" { fn read_args(...); }`      |
| AssemblyScript  | `@external("vm_hooks", "read_args")`     |
| C/C++           | `__attribute__((import_module("vm_hooks")))` |

---

## 🧱 Example in AssemblyScript

```ts
@external("vm_hooks", "read_args")
declare function read_args(ptr: i32): void;

@external("vm_hooks", "write_result")
declare function write_result(ptr: i32, len: i32): void;

// The only exported entrypoint
export function user_entrypoint(): void {
  // Read and dispatch
}
```

---

## ❌ Do Not Export These

You should **not export** internal logic functions like:

```ts
export function set_number(val: u64): void {} // ❌ Don't do this
```

Instead, handle these calls internally and dispatch based on calldata from `user_entrypoint`.

---

## ✅ Summary

- Stylus provides low-level functions (`vm_hooks`) as WASM imports
- Your contract must export a single function: `user_entrypoint`
- The logic of the contract should be dispatched from inside `user_entrypoint`
- You can use any language that compiles to WASM, as long as it supports:
  - Declaring host imports
  - Linear memory
  - Manual dispatch

This design ensures that all Stylus contracts are executed safely, consistently, and efficiently inside the Arbitrum Stylus virtual machine.

For more info, visit: [Stylus Docs](https://docs.arbitrum.io/stylus/)

---

### 🧠 Advanced Note: Macros in Rust vs AssemblyScript Workaround

In Rust, the `#[entrypoint]`, `#[public]`, and `sol_storage!` macros provided by the Stylus SDK generate a lot of internal code during compilation. You don't write or export your functions manually. Instead:

- The `#[entrypoint]` macro expands into:
  - A `#[no_mangle] pub extern "C" fn user_entrypoint(...)` export
  - A `router_entrypoint::<Contract, Contract>()` call that decodes calldata and dispatches the call
  - A trait implementation of `abi::Router` for your struct with `match selector` logic
- This is how functions like `number()` and `set_number(...)` become callable from the EVM.

You can view this expanded code with:

```bash
cargo expand --lib
```

This allows you to understand what Stylus injects at compile time.

---

### 🧱 Emulating this in AssemblyScript (without a runtime)

AssemblyScript doesn't support Rust-like procedural macros. However, you can **emulate a similar behavior** using **base classes** and manual dispatch logic.

You can create a reusable base class like:

```ts
export abstract class ContractBase {
  protected selector: u32 = 0;

  public user_entrypoint(): void {
    read_args(0);
    this.selector = load<u32>(0);

    if (this.selector == 0x12345678) this.handle_get();
    else if (this.selector == 0xABCDEF12) this.handle_set();
  }

  protected abstract handle_get(): void;
  protected abstract handle_set(): void;
}
```

Then implement your contract like this:

```ts
export class MyContract extends ContractBase {
  protected handle_get(): void {
    store<u64>(0, 42);
    write_result(0, 8);
  }

  protected handle_set(): void {
    let value = load<u64>(4);
    store<u64>(1000, value);
    write_result(0, 0);
  }
}

export function user_entrypoint(): void {
  new MyContract().user_entrypoint();
}
```

This lets you reuse `user_entrypoint()` across multiple contracts and keep the dispatch logic consistent — similar to how Stylus abstracts it behind macros in Rust.