import { malloc } from "./memory";
import {
  storage_load_bytes32,
  storage_cache_bytes32,
  storage_flush_cache,
} from "./hostio";

/** Creates a 32-byte storage key from a u64 (BigEndian) */
function createStorageKeyU32(slot: u64): usize {
  const key = malloc(32);
  for (let i = 0; i < 24; i++) store<u8>(key + i, 0);
  for (let i = 0; i < 8; i++) store<u8>(key + 31 - i, <u8>(slot >> (8 * i)));
  return key;
}

/** Stores a u32 into storage at the given slot */
export function storeU32(slot: u64, value: u32): void {
  const key = createStorageKeyU32(slot);
  const data = malloc(32);

  for (let i = 0; i < 28; i++) store<u8>(data + i, 0);
  for (let i = 0; i < 4; i++) store<u8>(data + 31 - i, <u8>(value >> (8 * i)));

  storage_cache_bytes32(key, data);
  storage_flush_cache(0);
}

/** Loads a u32 from storage at the given slot */
export function loadU32(slot: u64): u32 {
  const key = createStorageKeyU32(slot);
  const data = malloc(32);
  storage_load_bytes32(key, data);

  let result: u32 = 0;
  for (let i = 0; i < 4; i++) {
    result |= (<u32>load<u8>(data + 31 - i)) << (8 * i);
  }
  return result;
}
