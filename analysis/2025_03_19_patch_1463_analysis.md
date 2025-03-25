# Build Failure Analysis: 2025_03_19_patch_1463

## First error

../../net/websockets/websocket_frame_test.cc:282:8: error: initializer-string for char array is too long, array size is 1 but initializer has size 97 (including the null terminating character)

## Category
Rewriter encountered a case where it failed to add .data() when converting a C-style array to std::array in a third_party function call.

## Reason
The rewriter is converting C-style arrays to `std::array` using `std::to_array`. The `static_assert` on line 288 indicates that the sizes of the input and output arrays must be the same. Since `MaskPayload` (a function that takes raw pointer arguments) likely writes to `buffer`, and since this is a unit test, it's okay to keep using a C-style array here.

## Solution
In the diff, the `kTestOutput` variable is initialized as a `std::array` with a size of `1`. The rewriter did not correctly infer the size of the output array and failed to add `.data()` on line 316 because the rewriter should not have attempted to convert `kTestOutput` to `std::array` at all. The original code uses `kTestOutput` to compare a masked payload with a known value using `ASSERT_TRUE`. Since the function in question was expecting a raw pointer, and since the sizes are known to be the same, the proper fix is to not convert the C-style array at all when it is being passed to a function that takes raw pointer arguments. The rewriter should detect when a third_party function takes raw pointer arguments and avoid converting the C-style arrays to `std::array`.

## Note
The other two errors are due to this incorrect conversion.
```
../../net/websockets/websocket_frame_test.cc:288:17: error: static assertion failed due to requirement 'std::size(kTestInput) == std::size(kTestOutput)': output and input arrays should have the same length
../../net/websockets/websocket_frame_test.cc:316:44: error: invalid operands to binary expression ('const array<remove_cv_t<char>, 1UL>' (aka 'const array<char, 1UL>') and 'size_t' (aka 'unsigned long'))