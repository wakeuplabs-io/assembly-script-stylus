## Stylus Rust SDK

## Stylus Rust SDK Summary

| **Category**         | **Description**                                                                 |
|-----------------------|----------------------------------------------------------------------------------|
| **Types**             | `U256`, `I256`, `Address`, `Boolean`, `Bytes`                                   |
| **Variables**         | Locales, de Estado (`Storage*`), Globales (`msg::`, `block::`)                  |
| **Functions**         | Uso del macro `#[public]`                                                        |
| **Errors**            | Recuperables e irrecuperables (ej. `Err(...)`) – *[TODO: Expand error patterns]*|
| **Events**            | `sol! { event ... }` + `evm::log(...)`                                           |
| **Inheritance**       | `#[inherit]`, sin soporte para herencia múltiple                                 |
| **VM Affordances**    | `msg::sender()`, `msg::value()`, `block::timestamp()`                            |
| **Sending Ether**     | `evm::transfer_eth`, `evm::call`, `call_with_value(...)`                         |
| **ABI Encode/Decode** | `abi::encode`, `encode_packed`, `decode`                                        |
| **Hashing**           | `keccak::keccak256(...)`                                                         |
| **Advanced Topics**   | Composición, compatibilidad ABI, flujos de error – *[TODO: Extend docs]*        |



## Details

### Console
Use for debugging and logging purposes.

```rust
console!("Hello from Stylus Rust!");
```

---

### Primitive Types

- `U256`
- `I256`
- `Address`
- `Boolean`
- `Bytes`

---

### Variable Scopes

Stylus supports local, state, and global variables.

#### Example:

```rust
#[storage]
#[entrypoint]
pub struct Contract {
    initialized: StorageBool,
    owner: StorageAddress,
    max_supply: StorageU256,
}

// Global variables
let _timestamp = block::timestamp();
let _amount = msg::value();
```

---

### Constants

Constants are immutable values defined with a name.

```rust
const MAX_SUPPLY: u64 = 1000;
```

---

### Functions

Stylus public functions use the `#[public]` macro:

```rust
#[public]
impl MyContract {
    fn my_function() -> ArbResult {
        Ok(vec![])
    }
}
```

---

### Errors

Stylus uses `Recoverable` and `Unrecoverable` errors (WIP example).

```rust
return Err("Custom error".as_bytes().to_vec());
```

> **TODO:** Expand error types and handling with examples.

---

### Events

Events use the `sol!` macro and `evm::log`.

```rust
sol! {
    event Log(address indexed sender, string message);
    event AnotherLog();
}

#[storage]
#[entrypoint]
pub struct Events {}

#[public]
impl Events {
    fn user_main(_input: Vec<u8>) -> ArbResult {
        evm::log(Log {
            sender: Address::from([0x11; 20]),
            message: "Hello world!".to_string(),
        });

        evm::log(AnotherLog {});
        Ok(vec![])
    }
}
```

---

### Inheritance

Stylus supports single-contract composition using `#[inherit]`.  
> Multi-inheritance is **not** supported.

```rust
#[public]
#[inherit(Erc20)]
impl Token {
    pub fn mint(&mut self, amount: U256) -> Result<(), Vec<u8>> {
        ...
    }
}

#[public]
impl Erc20 {
    pub fn balance_of() -> Result<U256> {
        ...
    }
}
```

---

### VM Affordances

Interact with the VM to get block and message context:

```rust
let sender = msg::sender();
let value = msg::value();
let timestamp = block::timestamp();
```

---

### Sending Ether

Three main methods to send Ether in Stylus:

1. **Using `transfer_eth`:**

```rust
evm::transfer_eth(recipient, amount)?;
```

2. **Low-level `call` method:**

```rust
evm::call(recipient, payload, value)?;
```

3. **Sending value with a contract call:**

```rust
contract.call_with_value(args, value)?;
```

---

### ABI Encode & Decode

- `abi::encode`
- `abi::encode_packed`
- `abi::decode`

```rust
let encoded = abi::encode((value1, value2));
let decoded: (U256, Address) = abi::decode(&encoded)?;
```

---

### Hashing

Stylus uses `keccak256` for cryptographic hashing:

```rust
let hash = keccak::keccak256(b"some input");
```

---

### Advanced Topics (WIP)

> TODO: Complete these topics in the next iteration:
- Advanced error patterns
- ABI cross-compatibility
- Full guide on `#[inherit]` mechanics
- SDK module interaction patterns

For full reference: [Stylus Rust SDK Docs](https://docs.arbitrum.io/stylus/reference/rust-sdk-guide)
