import { execSync } from "child_process";
import { readFileSync, writeFileSync } from "fs";

execSync("wasm-pack build --target bundler --no-pack --release --out-name lib");
const wasmFile = readFileSync("./pkg/lib_bg.wasm");
const wasm64 = wasmFile.toString("base64");

const jsLib = readFileSync("./pkg/lib_bg.js").toString();
const newJsLib = `/* eslint-disable */ 
${jsLib}

const bytes = Uint8Array.from(atob("${wasm64}"), (c) => c.charCodeAt(0));

const wasmModule = new WebAssembly.Module(bytes);
const wasmInstance = new WebAssembly.Instance(wasmModule, {});
__wbg_set_wasm(wasmInstance.exports);
`;

writeFileSync("./pkg/index.js", newJsLib, { flag: "w+" });

execSync(`mv ./pkg/lib.d.ts ./src/wasm_lib.d.ts`);
execSync(`mv ./pkg/index.js ./src/wasm_lib.js`);
execSync(`rm -rf ./pkg`);
