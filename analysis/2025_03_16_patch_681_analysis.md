# Build Failure Analysis: 2025_03_16_patch_681

## First error

../../chrome/browser/process_singleton_posix.cc:232:44: error: invalid operands to binary expression ('base::span<char>' and 'size_t' (aka 'unsigned long'))

## Category
Rewriter needs to avoid pointer arithmetic on spans and account for size.

## Reason
The rewriter converted `char* buf` to `base::span<char> buf` and then tried to access an element of the span using pointer arithmetic: `buf + bytes_read`. Span does not support pointer arithmetic and the correct way to get a pointer to an element within a span is to use the indexing operator `[]`. This was then used with bufsize for more pointer arithmetic.

## Solution
The rewriter needs to replace `buf + bytes_read` with `buf.data() + bytes_read`, and also bufsize with buf.size(). data() converts the span to a pointer, so the pointer arithmetic will be valid, but this is still wrong as base::span expects indices to be passed to it and not pointers.
```C++
read(fd, buf.data() + bytes_read, bufsize - bytes_read)
```
should be replaced with
```c++
read(fd, buf.data() + bytes_read, buf.size() - bytes_read)
```

## Note
There is a second error in base/check.h, which indicates that a std::array is being passed to a logging function that expects a C-style string.
```c++
   NOTREACHED() << "The other process returned unknown message: " << buf;
```
This needs to be rewritten to pass `buf.data()` instead. Also this code should use `CHECK` with the inverted condition instead to avoid ever hitting NOTREACHED.
```c++
   CHECK(strncmp(buf.data(), kACKToken, std::size(kACKToken) - 1) == 0 || strncmp(buf.data(), kShutdownToken, std::size(kShutdownToken) - 1) == 0) << "The other process returned unknown message: " << buf;