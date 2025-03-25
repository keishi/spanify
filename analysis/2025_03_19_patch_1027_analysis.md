# Build Failure Analysis: 2025_03_19_patch_1027

## First error

../../base/files/file_unittest.cc:583:42: error: invalid operands to binary expression ('std::array<char, kDataSize>' and 'int')

## Category
Rewriter needs to add .data() to arrayified `char[]` variable used with std::string.

## Reason
The original code was using pointer arithmetic on `buffer` which was a `char[]`, but the rewriter changed the type to `std::array<char, kDataSize>`. The expression `buffer + first_chunk_size` is no longer valid because `+` is not defined between a `std::array` and an `int`.

## Solution
The rewriter needs to add `.data()` to arrayified `char[]` variables when they are used with pointer arithmetic.

In this case, the rewriter should transform:

```c++
file.ReadAtCurrentPos(buffer + first_chunk_size,
```

to:

```c++
file.ReadAtCurrentPos(buffer.data() + first_chunk_size,