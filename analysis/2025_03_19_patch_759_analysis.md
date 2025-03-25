# Build Failure Analysis: 2025_03_19_patch_759

## First error

../../base/rand_util_unittest.cc:164:47: error: invalid operands to binary expression ('std::array<uint8_t, buffer_size>' (aka 'array<unsigned char, buffer_size>') and 'const size_t' (aka 'const unsigned long'))

## Category
Rewriter needs to avoid using pointer arithmetic directly on `std::array` when passing to third-party functions.

## Reason
The rewriter replaced the `uint8_t buffer[]` with `std::array<uint8_t, buffer_size> buffer;`, but failed to update the line `std::sort(buffer, buffer + buffer_size);` correctly. `buffer + buffer_size` is pointer arithmetic, but `buffer` is now a `std::array` object, not a pointer, so the `+` operator is invalid. The proper way to get a pointer to the end of the buffer for sort is `buffer.data() + buffer.size()`.

## Solution
The rewriter needs to properly transform pointer arithmetic to `std::array` by recognizing `buffer + buffer_size` and converting that to `buffer.data() + buffer.size()`.

## Note
There is a similar secondary error one line later that also needs to be fixed in the same way.