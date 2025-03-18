# Build Failure Analysis: 2025_03_13_patch_1158

## First error

../../testing/libfuzzer/proto/skia_image_filter_proto_converter.cc:770:5: error: no matching function for call to 'memcpy'
  770 |     memcpy(num_arr, &four_byte_num, sizeof(four_byte_num));
      |     ^~~~~~

## Category
Rewriter needs to pass the address of a stack allocated std::array to memcpy.

## Reason
The code uses `memcpy` to copy the bytes of `four_byte_num` into the `num_arr` array. The `memcpy` function expects a pointer to the destination buffer, but the code is passing the `std::array` object `num_arr` directly. The compiler is complaining that there is no matching function because it cannot convert the `std::array` to a `void*`.

## Solution
The rewriter needs to pass the address of the underlying array data to `memcpy` by using the `.data()` method of the std::array.

```c++
memcpy(num_arr.data(), &four_byte_num, sizeof(four_byte_num));
```

## Note
Several other errors are similar.
```
../../testing/libfuzzer/proto/skia_image_filter_proto_converter.cc:770:5: error: no matching function for call to 'memcpy'