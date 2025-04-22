# 🧠 Understanding WebAssembly Architecture

This document provides a technical overview of WebAssembly's runtime architecture, its components, and how compilers and runtimes relate to it. We also compare how WebAssembly is used in platforms like **Arbitrum Stylus** with **Rust**, and in **AssemblyScript**.

---

## 📦 WebAssembly Runtime Architecture

WebAssembly (WASM) operates inside a **virtual machine** that provides the following core components:

```text
╔══════════════════════════════╗
╔════════════════════════════════════════╗
║         WebAssembly Thread Context     ║
╠════════════════════════════════════════╣
║ ▶ Call Stack                           ║
║   ┌─ Stack Frame: main                 ║
║   │  └─ locals, return addr, module    ║
║   ├─ Stack Frame: foo()                ║
║   │  └─ locals, return addr, module    ║
║   └─ Stack Frame: bar() ← ACTIVE       ║
║      └─ locals, return addr, module    ║
║                                        ║
║ ▶ Operand Stack (bar) ← ACTIVE         ║
║   └─ [val1, val2, val3]                ║
║                                        ║
║ ▶ Paused Operand Stacks (foo, main)    ║
║   ├─ foo → [valX]                      ║
║   └─ main → [empty]                    ║
║                                        ║
║ ▶ Linear Memory                        ║
║   └─ Raw bytes                         ║
║                                        ║
║ ▶ Globals                              ║
║   └─ Global vars                       ║
║                                        ║
║ ▶ Table                                ║
║   └─ Function refs                     ║
╚════════════════════════════════════════╝

```
>Note: While only one operand stack is active at any time (belonging to the currently executing function), each stack frame preserves its own operand stack state. When a function call returns, its operand stack is discarded and the one from the previous frame becomes active again. This ensures isolated evaluation per function.

### 🧩 Component Breakdown

- **Call Stack**: Stack of active function calls. Each entry is a **stack frame**.
- **Stack Frame**: Contains:
  - Function **locals** (local variables and parameters)
  - Reference to the **module instance**
  - Return address and control flow state
- **Operand Stack**: Temporary execution stack for intermediate values.
- **Linear Memory**: A contiguous byte array accessible by WASM instructions.
- **Globals**: Mutable or immutable global values shared by the module.
- **Table**: Used for dynamic (indirect) function calls, like vtables in OOP.

---

## 🧠 Compiler vs Runtime

### ✅ Compiler (`asc`, `rustc`, etc.)

A compiler takes your **source code** (Rust, AssemblyScript, C...) and compiles it into a `.wasm` binary.

Examples:

- `asc` → AssemblyScript Compiler
- `rustc --target wasm32-unknown-unknown` → Rust for WASM

### ✅ Runtime

The runtime provides **memory management**, **garbage collection**, **type metadata**, and often includes **helper functions** like:

- `__new`, `__collect`, `__pin`, etc. (in AssemblyScript)
- `log`, `get_call_data`, etc. (in Arbitrum Stylus via `stylus-sdk`)

---

## 🔎 Runtime: Arbitrum Stylus vs AssemblyScript

| Feature                  | Arbitrum Stylus (Rust)         | AssemblyScript                |
|--------------------------|-------------------------------|-------------------------------|
| GC                       | ❌ No (manual memory mgmt)     | ✅ Optional (`runtime: full`) |
| Runtime included         | ❌ No                          | ✅ (configurable)             |
| Uses `std::string::String` | ⚠️ With `alloc`, no full `std` | ✅ (via GC + heap)            |
| Target                   | `wasm32-unknown-unknown`       | Custom AssemblyScript runtime|

Stylus expects **pure WASM** modules compiled without standard runtime dependencies. Developers must manage memory or use `alloc`.

---

## 🧪 Basic WebAssembly Text Format (`.wat`) Example

```wat
(module
  (type $addType (func (param i32 i32) (result i32)))
  (func $add (type $addType)
    local.get 0      ;; push first param onto operand stack
    local.get 1      ;; push second param
    i32.add          ;; pop two i32s, push result
  )
  (export "add" (func $add))
)
```

### 🧠 Instruction Summary

| Instruction    | Description                                                        |
|----------------|--------------------------------------------------------------------|
| `local.get N`  | Pushes the value of the Nth local onto the operand stack           |
| `local.set N`  | Pops a value from the operand stack and stores it in local N       |
| `i32.add`      | Pops two `i32` values and pushes their sum                         |
| `type`         | Defines a function signature (params + return types)               |
| `func`         | Defines a function, with optional locals                           |
| `export`       | Makes the function accessible from outside the module              |

### 🧩 Notes

- The **operand stack is not part of the stack frame**, but it is activated per frame.
- The **call stack** contains stack frames; each function call creates a new one.
- WebAssembly doesn't have a GC by default — it's either implemented manually (like in Stylus) or compiled into the module (like in AssemblyScript).
- Strings and objects in WASM require memory layout awareness or runtime support.
