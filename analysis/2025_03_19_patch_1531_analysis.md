# Build Failure Analysis: 2025_03_19_patch_1531

## First error

../../chrome/browser/process_singleton_posix.cc:693:24: error: invalid operands to binary expression ('std::array<char, kMaxMessageLength>' and 'size_t' (aka 'unsigned long'))
  693 |         read(fd_, buf_ + bytes_read_,

## Category
Rewriter needs to add .data() to arrayified `char[]` variable used with `read`.

## Reason
The code attempts to perform pointer arithmetic on `buf_`, which is now an `std::array<char, kMaxMessageLength>`. The `read` function expects a `char*` as its second argument, but `buf_ + bytes_read_` attempts to add a numerical offset to the `std::array` itself, which is not allowed. The rewriter converted the `char buf_[]` to `std::array<char, kMaxMessageLength> buf_`, however, it failed to add `.data()` when that variable is used with `read`.

## Solution
The rewriter needs to recognize this pattern where a `char[]` is converted to `std::array<char, kMaxMessageLength>` but it is passed as a buffer to read, and add `.data()` to the variable.

```c++
-       read(fd_, buf_ + bytes_read_,
+       read(fd_, buf_.data() + bytes_read_,
```

## Note
The error occurs in `HANDLE_EINTR` which expands to multiple `read` calls which is why the error appears twice in the log.