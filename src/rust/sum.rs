use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub fn sum(arr1: &[isize]) -> isize {
    let mut output: isize = 0;

    for x in arr1 {
        output += x;
    }

    return output;
}
