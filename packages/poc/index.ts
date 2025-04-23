
import { read_args, write_result } from "./core/hostio";
import { __keep_imports } from "./core/keep-imports";
import {  createTopicFromU32, emitLogOnlyTopic } from "./core/log";
import { malloc } from "./core/memory";
import { loadU32, storeU32 } from "./core/storage";

__keep_imports();

export function user_entrypoint(args_len: usize): i32 {
  const position = memory.grow(<i32>((args_len + 0xffff) >> 16));
  read_args(position);
  const selector = load<u8>(0);
  let result: usize = 0;

  if (selector == 0x01) { increment(); return 0; }
  if (selector == 0x02) { decrement(); return 0; }
  if (selector == 0x03) {
    result = get();

    write_result(result, 4);
    return 0;
  }
  
  write_result(result as usize, sizeof<u32>());
  return 0;
}

export function increment(): void{
  const value: u32 = loadU32(0);
  const newValue = value + 1;
  storeU32(0, newValue);
  const topic1 = createTopicFromU32(newValue);
  emitLogOnlyTopic(topic1);
}; 

export function decrement(): void{
  const value = loadU32(0);
  const newValue: u32 = value - 1;
  storeU32(0, newValue);
  const topic1 = createTopicFromU32(newValue);
  emitLogOnlyTopic(topic1);
};

export function get(): usize {
  const value: u32 = loadU32(0);
  const ptrResult = malloc(4);
  store<u8>(ptrResult + 3, value as u8);
  store<u8>(ptrResult + 2, (value >> 8) as u8);
  store<u8>(ptrResult + 1, (value >> 16) as u8);
  store<u8>(ptrResult + 0, (value >> 24) as u8);
  return ptrResult;
}