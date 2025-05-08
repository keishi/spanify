# Build Failure Analysis: 2025_05_02_patch_25

## First error

testing/libfuzzer/fuzzers/libyuv_scale_fuzzer.cc:125:28: error: no matching function for call to 'I420Scale_16'

## Category
Rewriter needs to add .data() when converting a C-style array to std::array in a third_party function call.

## Reason
The rewriter converted `p_src_u_16` from `uint16_t*` to `base::span<uint16_t>`. However, the `I420Scale_16` function in libyuv expects a `uint16_t*` as its third argument. The rewriter failed to add `.data()` to the span when passing it to the third-party function.

## Solution
The rewriter should automatically add `.data()` when a spanified variable is passed as an argument to a third-party function that expects a raw pointer. This applies specifically when the original variable was a C-style array converted to `base::span` or `std::array`. The rewriter should check if a spanified argument is being passed to a third party function and then append ".data()" to it to convert it back to a raw pointer.

## Note
The same issue exists at line 137, where it should be `free(p_src_u_16.data());` instead of `free(p_src_u_16);`. This is also caused by the missing of `.data()` during the free call after spanifying.