# Build Failure Analysis: 2025_05_02_patch_1621

## First error

../../chrome/browser/process_singleton_posix.cc:693:24: error: invalid operands to binary expression ('std::array<char, kMaxMessageLength>' and 'size_t' (aka 'unsigned long'))

## Category
Rewriter needs to handle pointer arithmetic with std::array.

## Reason
The error occurs because the code is trying to perform pointer arithmetic on a `std::array` using the `+` operator. `std::array` does not support pointer arithmetic in the same way as a raw C-style array. The expression `buf_ + bytes_read_` attempts to add an offset to the `std::array` object itself, which is not a valid operation.

## Solution
Instead of `buf_ + bytes_read_`, the code should use `buf_.data() + bytes_read_` to get a pointer to the underlying data of the `std::array` and then perform pointer arithmetic on that pointer.

## Note
The same error happens in line 693, and 693.