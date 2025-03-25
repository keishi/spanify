# Build Failure Analysis: 2025_03_19_patch_1904

## First error

../../base/strings/string_number_conversions_internal.h:44:33: error: invalid operands to binary expression ('std::array<CHR, kOutputBufSize>' (aka 'array<char, kOutputBufSize>') and 'const size_t' (aka 'const unsigned long'))
   44 |   CHR* end = UNSAFE_TODO(outbuf + kOutputBufSize);

## Category
Rewriter needs to account for `std::array` not decaying to a pointer like a C-style array.

## Reason
The rewriter changed `CHR outbuf[kOutputBufSize];` to `std::array<CHR, kOutputBufSize> outbuf;`. The code then attempts to calculate a pointer to the end of the buffer using pointer arithmetic: `outbuf + kOutputBufSize`. However, `std::array` does not decay to a pointer like a C-style array. Therefore, the `+` operator is not valid.

## Solution
The rewriter should use `.data()` to get a pointer to the underlying array and then perform the pointer arithmetic.

Change this:
```c++
CHR* end = UNSAFE_TODO(outbuf + kOutputBufSize);
```

to this:
```c++
CHR* end = UNSAFE_TODO(outbuf.data() + kOutputBufSize);