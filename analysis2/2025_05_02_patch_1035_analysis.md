# Build Failure Analysis: 2025_05_02_patch_1035

## First error

../../base/rand_util_unittest.cc:164:47: error: invalid operands to binary expression ('std::array<uint8_t, buffer_size>' (aka 'array<unsigned char, buffer_size>') and 'const size_t' (aka 'const unsigned long'))
  164 |   EXPECT_GT(std::unique(buffer.data(), buffer + buffer_size) - buffer, 25);
      |                                        ~~~~~~ ^ ~~~~~~~~~~~

## Category
Rewriter added .data() to a variable/member it did not spanify/arrayify.

## Reason
The rewriter changed `uint8_t buffer[buffer_size]` to `std::array<uint8_t, buffer_size> buffer`.

The original code was:
```c++
EXPECT_GT(std::unique(buffer, buffer + buffer_size) - buffer, 25);
```
After arrayification, the rewriter changed it to:
```c++
EXPECT_GT(std::unique(buffer.data(), buffer + buffer_size) - buffer, 25);
```

The rewriter correctly added `.data()` to the first argument of `std::unique`. However, the rewriter should not have added `.data()` to `buffer + buffer_size` and should not have left `buffer` as is.

The correct rewrite should be:
```c++
EXPECT_GT(std::unique(buffer.data(), buffer.data() + buffer_size) - buffer.data(), 25);
```

The first error is `buffer + buffer_size`. The rewriter incorrectly added `.data()` to `buffer.data()` in the `std::sort` line, it should have added `.data()` in this line.

## Solution
The rewriter should consistently rewrite all occurrences of the original C-style array to use `.data()` after arrayification when that variable represents a pointer and not an array.

Specifically, the rewriter should add `.data()` to both `buffer` arguments:
`std::unique(buffer.data(), buffer.data() + buffer_size)` and then subtract `buffer.data()` and not `buffer`.

## Note
The rewriter incorrectly added `.data()` in the `std::sort` function too.
The code:
```c++
std::sort(buffer.data(),
            base::span<uint8_t>(buffer).subspan(buffer_size).data());
```
should be:
```c++
std::sort(buffer.data(), buffer.data() + buffer_size);