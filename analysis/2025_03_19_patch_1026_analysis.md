# Build Failure Analysis: 2025_03_19_patch_1026

## First error

../../base/files/file_unittest.cc:634:47: error: invalid operands to binary expression ('std::array<char, kDataSize>' and 'const int')
  634 |   EXPECT_EQ(std::string(buffer.data(), buffer + kDataSize), std::string(kData));

## Category
Rewriter added .data() to a variable/member it did not spanify/arrayify.

## Reason
The rewriter converted `char[]` to `std::array`, but when constructing `std::string` from that `std::array`, the rewriter should have added `.data()`, but instead it added `.data()` to the `std::array` variable `buffer` itself, which caused this compilation error. The std::string constructor that takes a `const char*` as an argument, expects a pointer as the second argument. Adding `kDataSize` (which is an int) to `buffer` (which is an `std::array<char, kDataSize>`) is invalid.

## Solution
The rewriter should add `.data()` to the `std::array` variable when constructing `std::string`, so that the argument to the `std::string` constructor remains a `const char*`.

## Note
There are other instances of this error in the build log.