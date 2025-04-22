## 🔧 Entrypoint Macro Flow in Stylus — With Structs and Interfaces

Stylus defines a procedural macro named `#[entrypoint]` that transforms either a struct or a function into the proper entrypoint for the Stylus VM. This macro is defined in the `stylus-proc` crate and orchestrates multiple components during compilation.

### 📌 Macro Entry

- The macro is declared as `#[proc_macro_attribute]` and implemented in the function `entrypoint(attr: TokenStream, input: TokenStream)`.
- This function delegates the logic to `macros::entrypoint`.

### 📥 Parsing Stage

- The input is parsed into an `Entrypoint` struct using the `Parse` trait.
- The enum `EntrypointKind` is used internally to differentiate between `EntrypointKind::Fn` and `EntrypointKind::Struct`.

Depending on what was parsed:

#### If it is a function:
- It is wrapped inside the `EntrypointFn` struct.
- The macro expands directly into that function body and registers it as the entrypoint.

#### If it is a struct:
- It is wrapped in `EntrypointStruct`, which triggers the generation of more code.
- `EntrypointStruct` includes:
  - `top_level_storage_impl()` → Generates an `impl TopLevelStorage for YourContract {}` block.
  - `struct_entrypoint_fn()` → Creates the `fn user_entrypoint(...)` which will be called by the VM.
  - `assert_overrides_const()` → Ensures your contract implements the expected entrypoint function via a constant check.
  - `print_abi_fn()` and `print_from_args_fn()` → Functions to export the ABI (if feature `export-abi` is enabled).

### 🧱 Codegen Details

The generated code includes:

- `impl TopLevelStorage for <YourStruct>`: This lets the runtime know your struct holds persistent storage.
- `fn user_entrypoint(...) -> ArbResult`: Main VM entry function that deserializes inputs and routes the call.
- ABI export functions (only if the feature `export-abi` is enabled).

### 🚀 Runtime Execution

At runtime, the Stylus VM calls `user_entrypoint`, which:
- Receives raw input bytes and a `host::VM` instance (from the `vm_hooks`).
- Calls `router_entrypoint::<T, T>()` — this is a generic function that:
  - Instantiates the contract.
  - Routes the call based on the function selector.
  - Returns the encoded result or error.

### 🧠 Why It Matters

This macro encapsulates complex behavior behind simple annotations. To replicate this in another language like AssemblyScript, you would need to:
- Manually define something like `TopLevelStorage`.
- Implement your own `user_entrypoint` logic.
- Use your own ABI deserialization and function dispatching.
- Interface with the VM via the low-level `hostio`/`vm_hooks`.

The macro ultimately bridges Rust userland code with the WASM entry required by the Arbitrum Stylus VM.







## ✅ `vm_hooks` Module Capabilities

These are low-level host I/O functions exposed by the Stylus runtime. They map closely to EVM opcodes and allow direct interaction with the VM.

### 🧾 Account Functions
- `account_balance(address, dest)`: Get the ETH balance of an address.
- `account_code(address, offset, size, dest) -> usize`: Read contract code bytes from an address.
- `account_code_size(address) -> usize`: Get the size of the contract code.
- `account_codehash(address, dest)`: Get the code hash of an address.

### 💾 Storage
- `storage_load_bytes32(key, dest)`: Read a 32-byte value from permanent storage (EVM `SLOAD`).
- `storage_cache_bytes32(key, value)`: Write a 32-byte value to the storage cache (EVM `SSTORE`).
- `storage_flush_cache(clear: bool)`: Persist cached storage to the EVM state trie.

### 📦 Contract Context
- `contract_address(dest)`: Get the current contract’s address.
- `msg_sender(dest)`: Get the address of the caller (`CALLER`).
- `msg_value(dest)`: Get the ETH value sent with the message (`CALLVALUE`).
- `msg_reentrant() -> bool`: Check if the current call is reentrant.

### 🔁 Contract Calls
- `call_contract(contract, calldata, calldata_len, value, gas, return_data_len) -> u8`: Standard external call (`CALL`).
- `delegate_call_contract(contract, calldata, calldata_len, gas, return_data_len) -> u8`: Delegate call (`DELEGATECALL`).
- `static_call_contract(contract, calldata, calldata_len, gas, return_data_len) -> u8`: Static call (`STATICCALL`).
- `create1(code, code_len, endowment, contract, revert_data_len)`: Deploy a contract using `CREATE`.
- `create2(code, code_len, endowment, salt, contract, revert_data_len)`: Deploy a contract using `CREATE2`.

### 📦 ABI & Return Data
- `read_args(dest)`: Read calldata.
- `read_return_data(dest, offset, size) -> usize`: Read return data from previous call.
- `return_data_size() -> usize`: Get length of the return data.
- `write_result(data, len)`: Set the return result of the current execution.

### ⛽ Gas & Execution Context
- `block_basefee(dest)`: Get basefee of the current block.
- `block_coinbase(dest)`: Get coinbase address.
- `block_gas_limit() -> u64`: Get gas limit of the current block.
- `block_number() -> u64`: Get block number.
- `block_timestamp() -> u64`: Get block timestamp.
- `chainid() -> u64`: Get chain ID.
- `tx_gas_price(dest)`: Get the gas price.
- `tx_ink_price() -> u32`: Get the ink price (Stylus-specific compute unit).
- `tx_origin(dest)`: Get original transaction sender (`ORIGIN`).
- `evm_gas_left() -> u64`: Remaining gas (`GAS`).
- `evm_ink_left() -> u64`: Remaining ink (Stylus-specific).
- `pay_for_memory_grow(pages)`: Notify VM of WASM memory growth.

### 🧮 Cryptography & Logging
- `native_keccak256(bytes, len, output)`: Compute `keccak256` hash (`SHA3`).
- `emit_log(data, len, topics)`: Emit EVM log (`LOG0–LOG4`).


- Address: 0x3f1Eae7D46d88F08fc2F8ed27FCb2AB183EB2d0E
- Private key: 0xb6b15c8cb491557369f3c7d2c287b053eb229daa9c22138887752191c9520659