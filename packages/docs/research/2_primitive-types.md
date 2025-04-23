# 🧬 Primitive Type Definitions for Stylus-Compatible AssemblyScript Contracts

This document defines the data types we will use in smart contracts written in AssemblyScript for Arbitrum Stylus, **without relying on the standard runtime or garbage collector**.

Target environment:  
- WebAssembly (`wasm32`)
- No GC, no `String`, no `Array`, no `Map`
- `"runtime": "none"` or `"stub"`
- Compatible with `wasm32-unknown-unknown` expectations

---

## ✅ Core Primitive Types

| Use Case        | Type Name     | AssemblyScript Primitive | Memory Representation    | Notes                          |
|-----------------|---------------|---------------------------|---------------------------|--------------------------------|
| Address         | `Address`     | `u64`                     | 8 bytes                   | Unique 64-bit identifier (e.g., public key hash or address) |
| Token Balance   | `Balance`     | `u64`                     | 8 bytes                   | Integer in smallest unit (e.g., wei, satoshi) |
| Numeric ID      | `Id`          | `u32` / `i32`             | 4 bytes                   | General identifier |
| Boolean Flag    | `Flag`        | `bool`                    | 1 byte                    | Use `0x00` for false, `0x01` for true |
| Byte Array      | `Bytes`       | `u8[]`                    | Raw bytes in linear memory | Requires manual handling of pointer and length |
| Text Field      | `Text`        | —                         | `u8[]` at known offset    | Can represent token name, symbol, metadata, etc. Must be written/read via memory.copy |
| Amount/Value    | `Amount`      | `u64`                     | 8 bytes                   | For tokens, prices, etc. |

---

## 🧠 Manual String Representation

Since `String` is not available, we use **manual string handling** via `u8[]` in linear memory.

This technique applies to all text fields: token names, symbols, error messages, arbitrary metadata, etc.

### Pattern:

- Strings must be passed as:  
  `ptr: i32` → memory offset of the string  
  `len: i32` → length in bytes

- To store a string in WASM memory:  
  Use `memory.copy(dest, src, len)`

- To retrieve a string in JS:
```ts
const mem = new Uint8Array(wasm.memory.buffer);
const str = new TextDecoder().decode(mem.slice(ptr, ptr + len));
```

---

## 🧠 Memory Layout Example

Assume:

- A text field lives at `offset = 1024`
- Value is "STYLUS" (6 bytes)

Then in memory:

```
+--------+--------+--------+--------+--------+--------+
|  83    |  84    |  89    |  76    |  85    |  83    |
+--------+--------+--------+--------+--------+--------+
   ^                                      ^
 1024                                    1029
```

We also store the length (`6`) in a separate `i32` global or variable.

---

## 🧱 Example: Declaring and Accessing Text Fields

```ts
let owner: u64 = 0;
let balance: u64 = 0;

const TEXT_FIELD_OFFSET: usize = 1024;
let textFieldLength: i32 = 0;

export function setTextField(ptr: i32, len: i32): void {
  textFieldLength = len;
  memory.copy(TEXT_FIELD_OFFSET, ptr, len);
}

export function getTextFieldPtr(): i32 {
  return <i32>TEXT_FIELD_OFFSET;
}

export function getTextFieldLength(): i32 {
  return textFieldLength;
}

export function setOwner(addr: u64, amount: u64): void {
  owner = addr;
  balance = amount;
}

export function getBalance(addr: u64): u64 {
  return addr == owner ? balance : 0;
}
```

---

## 🧱 Emulating Structs

AssemblyScript with `"runtime": "none"` does not support `class` or `struct` directly, but you can emulate structs manually using fixed memory layouts.

### Example:

Imagine this structure:

```c
struct Metadata {
  u64 id;
  u64 balance;
  char[32] label;
}
```

You can reserve a memory region, and read/write each field using `store` and `load`:

```ts
const METADATA_OFFSET: usize = 2048;

function setMetadata(id: u64, balance: u64, labelPtr: usize, labelLen: i32): void {
  store<u64>(METADATA_OFFSET, id);
  store<u64>(METADATA_OFFSET + 8, balance);
  memory.copy(METADATA_OFFSET + 16, labelPtr, labelLen);
}

function getMetadataId(): u64 {
  return load<u64>(METADATA_OFFSET);
}
```

This gives you struct-like behavior while staying runtime-free and Stylus-compatible.

---

## ❗ Limitations

- No dynamic allocation (no `new`, `Array`, `Map`, etc.)
- No GC (must manage memory manually)
- No type introspection or polymorphism
- Manual host-side handling is required for all encoded data

---

## ✅ Summary

When targeting Arbitrum Stylus with AssemblyScript, we use:

- Raw value types (`u64`, `i32`, `u8`)
- Linear memory for all "objects"
- Manual serialization/deserialization
- Manual memory layout for struct-like behavior
- No reliance on AssemblyScript's runtime

This gives us full control and compatibility with WASM environments that don’t support high-level runtime behavior.