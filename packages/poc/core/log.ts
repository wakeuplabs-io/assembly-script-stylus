import { emit_log } from "./hostio";

export function createTopicFromU32(value: u32): usize {
  const page = memory.grow(1);
  const ptr: usize = page << 16;

  for (let i = 0; i < 28; i += 4) {
    store<u32>(ptr + i, 0);
  }

  store<u8>(ptr + 28, (value >> 24) as u8);
  store<u8>(ptr + 29, (value >> 16) as u8);
  store<u8>(ptr + 30, (value >> 8) as u8);
  store<u8>(ptr + 31, value as u8);

  return ptr;
}

export function emitLogOnlyTopic(t1: usize): void {
  const totalLen = 32;
  const page = memory.grow(1);
  const ptr: usize = page << 16;

  for (let i = 0; i < 32; i++) {
    store<u8>(ptr + i, load<u8>(t1 + i));
  }

  emit_log(ptr, totalLen, 1);
}

