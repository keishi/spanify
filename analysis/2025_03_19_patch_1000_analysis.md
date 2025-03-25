# Build Failure Analysis: 2025_03_19_patch_1000

## First error

../../media/gpu/vaapi/vaapi_jpeg_encoder.cc:96:5: error: no matching function for call to 'SafeArrayMemcpy'

## Category
Rewriter needs to add .data() when converting a C-style array to std::array in a third_party function call.

## Reason
The rewriter converted `uint8_t code_length[16]` to `std::array<uint8_t, 16> code_length`. However, the `SafeArrayMemcpy` function expects a C-style array as input. The rewriter failed to add `.data()` to the `code_length` member when passing it to `SafeArrayMemcpy`.

## Solution
The rewriter should recognize this pattern and add `.data()` when passing a `std::array` to a function that expects a C-style array, especially when the function might be in third_party/.

```c++
memcpy(huffman_table->huffman_table[i].num_dc_codes,
       dc_table[i].code_length.data(), //Add .data() here.
       sizeof(huffman_table->huffman_table[i].num_dc_codes));
```

## Note
The same error occurs again on line 110.