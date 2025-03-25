# Build Failure Analysis: 2025_03_19_patch_51

## First error

../../media/filters/chunk_demuxer_unittest.cc:783:58: error: invalid operands to binary expression ('const array<remove_cv_t<unsigned char>, 16UL>' (aka 'const array<unsigned char, 16UL>') and 'decltype(__c.size())' (aka 'unsigned long'))

## Category
Rewriter failed to apply subspan rewrite to a spanified return value.

## Reason
The code `kEncryptedMediaInitData + std::size(kEncryptedMediaInitData)` should have been replaced with `kEncryptedMediaInitData.data() + std::size(kEncryptedMediaInitData)`. But since kEncryptedMediaInitData was arrayified, it should be `kEncryptedMediaInitData.data() + kEncryptedMediaInitData.size()`. The expression evaluates the sum of a pointer and a size, which is illegal given the types involved.

## Solution
The rewriter should be updated to handle arrayified return values when applying subspan.

## Note
There were no other errors in the provided build log.