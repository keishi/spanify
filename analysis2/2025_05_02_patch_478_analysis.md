# Build Failure Analysis: 2025_05_02_patch_478

## First error

```
../../content/browser/indexed_db/indexed_db_leveldb_coding_unittest.cc:430:75: error: invalid operands to binary expression ('const array<remove_cv_t<unsigned char>, 4UL>' (aka 'const array<unsigned char, 4UL>') and 'int')
  430 |       1u, WrappedEncodeBinary(std::string(binary_data.data(), binary_data + 0))
      |                                                               ~~~~~~~~~~~ ^ ~
```

## Category
Rewriter encountered a case where it failed to add .data() when converting a C-style array to std::array in a third_party function call.

## Reason
The code constructs a `std::string` using pointers to the beginning and (one-past-the) end of the `binary_data` array. After the rewrite, `binary_data` is a `std::array`. The expression `binary_data + 0` attempts to perform pointer arithmetic on `binary_data`, but `binary_data` is no longer a pointer; it's a `std::array`. The compiler error "invalid operands to binary expression" indicates that the `+` operator is not defined between a `std::array` and an integer. The rewriter should have added `.data()` to convert `binary_data` to a pointer before the addition.

## Solution
The rewriter should add `.data()` to the `binary_data` variable when it's used in pointer arithmetic after being converted to a `std::array`. The corrected code should be:

```c++
WrappedEncodeBinary(std::string(binary_data.data(), binary_data.data() + 0))
```

## Note
The same error occurs multiple times within the same test function.