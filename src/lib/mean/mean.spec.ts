import lodash from "lodash";
import { describe, expect, it } from "vitest";
import { meanJs, meanWasm } from "./mean";

describe("meanWasm", () => {
  describe("should be equal to pure js implementation", () => {
    for (let i = 0; i < 15; i++) {
      it(`Test case (length: ${2 ** i})`, () => {
        const input = generateRandomSequence(2 ** i);

        const mJs = meanJs(input);
        const mWasm = meanWasm(input);

        expect(mWasm).toEqual(mJs);
      });
    }
  });

  describe("should be equal to pure lodash implementation", () => {
    for (let i = 0; i < 15; i++) {
      it(`Test case (length: ${2 ** i})`, () => {
        const input = generateRandomSequence(2 ** i);

        const mJs = lodash.mean(input);
        const mWasm = meanWasm(input);

        expect(mWasm).toEqual(mJs);
      });
    }
  });
});

function generateRandomSequence(n: number): number[] {
  const MAX_INT = 100;
  const arr: number[] = [];

  for (let i = 0; i < n; i++) {
    arr.push(Math.floor(Math.random() * MAX_INT));
  }

  return arr;
}
