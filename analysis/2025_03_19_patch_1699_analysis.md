# Build Failure Analysis: 2025_03_19_patch_1699

## First error

../../testing/libfuzzer/proto/skia_image_filter_proto_converter.cc:770:5: error: no matching function for call to 'memcpy'

## Category
Rewriter needs to handle address of a spanified variable passed into a function.

## Reason
The rewriter replaced `char num_arr[sizeof(four_byte_num)];` with `std::array<char, sizeof(four_byte_num)> num_arr;`. However, the `memcpy` function expects a `void*` as its destination argument, but it is receiving a `std::array`, which is not implicitly convertible to a `void*`. The `memcpy` function needs the address of the underlying data, which can be obtained by calling `.data()` on the `std::array`.

## Solution
The rewriter needs to detect when a stack-allocated array is being passed to `memcpy` (or similar C functions) and add `.data()` to the argument.

## Note
Several other errors occur due to the same root cause.