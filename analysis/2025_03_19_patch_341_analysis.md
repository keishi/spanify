# Build Failure Analysis: 2025_03_19_patch_341

## First error

../../content/browser/indexed_db/indexed_db_leveldb_coding_unittest.cc:431:75: error: invalid operands to binary expression ('const array<remove_cv_t<unsigned char>, 4UL>' (aka 'const array<unsigned char, 4UL>') and 'int')

## Category
Rewriter encountered a case where it failed to add .data() when converting a C-style array to std::array in a third_party function call.

## Reason
The rewriter replaced the C-style array with std::array, but failed to append `.data()` at the call site `std::string(binary_data, binary_data + 0)`. It is failing because it is trying to add the result with an integer and there is no overload that supports this.

## Solution
The rewriter should add .data() when converting a C-style array to std::array when that variable is passed to a third_party function call.

## Note
All errors are the same, so fixing one should fix all.