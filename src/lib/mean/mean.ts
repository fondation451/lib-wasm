import { sum as __sumWasm__ } from "../../wasm_lib";

export function mean(arr: number[]): number {
  return arr.length < 128 ? meanJs(arr) : meanWasm(arr);
}

export function meanWasm(arr: number[]): number {
  return __sumWasm__(arr as any) / arr.length;
}

export function meanJs(arr: number[]): number {
  let output = 0;

  for (const x of arr) {
    output += x;
  }

  return output / arr.length;
}
