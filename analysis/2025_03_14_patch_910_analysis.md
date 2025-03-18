# Build Failure Analysis: 2025_03_14_patch_910

## First error

../../media/filters/chunk_demuxer_unittest.cc:783:58: error: invalid operands to binary expression ('const array<remove_cv_t<unsigned char>, 16UL>' (aka 'const array<unsigned char, 16UL>') and 'decltype(__c.size())' (aka 'unsigned long'))

## Category
Rewriter encountered a case where it failed to add .data() when converting a C-style array to std::array in a third_party function call.

## Reason
The code is passing `kEncryptedMediaInitData` (which is now a `std::array`) and an offset `kEncryptedMediaInitData + std::size(kEncryptedMediaInitData)` to the std::vector constructor in the OnEncryptedMediaInitData mock call. The compiler is complaining because it doesn't know how to add a `std::array` and an `unsigned long`. The rewriter failed to add `.data()` to the array which caused this compiler error.

## Solution
The rewriter should add `.data()` when converting a C-style array to `std::array`, when that variable is used in pointer arithmetic.

## Note
The other errors are related to the first error, since the rewriter did not add `.data()` to the expression and there are other errors.