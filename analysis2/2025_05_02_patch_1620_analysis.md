# Build Failure Analysis: 2025_05_02_patch_1620

## First error

../../chrome/browser/process_singleton_posix.cc:232:44: error: invalid operands to binary expression ('base::span<char>' and 'size_t' (aka 'unsigned long'))
  232 |     ssize_t rv = HANDLE_EINTR(read(fd, buf + bytes_read, bufsize - bytes_read));
      |                                        ~~~ ^ ~~~~~~~~~~

## Category
Rewriter needs to add .data() to spanified variable used with pointer arithmetic.

## Reason
The code is attempting to perform pointer arithmetic on a `base::span<char>` named `buf`. The `read` function expects a `char*` as an argument, but the rewriter has changed `buf` to a `base::span<char>`. The compiler is complaining that it cannot add a `size_t` to a `base::span<char>`. The rewriter should have added `.data()` to `buf` before performing the pointer arithmetic.

## Solution
The rewriter should recognize this pattern and add `.data()` to the `buf` variable when it is used in pointer arithmetic, like buf + bytes_read.

## Note
The file also has an error where the rewriter failed to add `.data()` to a spanified variable used with logging, but it is not the first error.