# Build Failure Analysis: 2025_03_14_patch_815

## First error

../../testing/libfuzzer/proto/skia_image_filter_proto_converter.cc:770:5: error: no matching function for call to 'memcpy'
  770 |     memcpy(num_arr, &four_byte_num, sizeof(four_byte_num));
      |     ^~~~~~

## Category
Rewriter needs to handle address of a spanified variable passed into a function.

## Reason
The rewriter replaced `char num_arr[sizeof(four_byte_num)];` with `std::array<char, sizeof(four_byte_num)> num_arr;`. However, `memcpy` expects a `char*` as the first argument, but it received `std::array`.

## Solution
The rewriter should recognize when it replaces a C-style array with `std::array` but the variable is passed into `memcpy` and then add `.data()` to the variable. The line should be rewritten to:
`memcpy(num_arr.data(), &four_byte_num, sizeof(four_byte_num));`

## Note
There are multiple call sites with this error so it seems like a common pattern.
```
../../testing/libfuzzer/proto/skia_image_filter_proto_converter.cc:770:5: error: no matching function for call to 'memcpy'
  770 |     memcpy(num_arr, &four_byte_num, sizeof(four_byte_num));
      |     ^~~~~~