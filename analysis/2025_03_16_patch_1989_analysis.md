# Build Failure Analysis: 2025_03_16_patch_1989

## First error

../../media/filters/chunk_demuxer_unittest.cc:783:58: error: invalid operands to binary expression ('const array<remove_cv_t<unsigned char>, 16UL>' (aka 'const array<unsigned char, 16UL>') and 'decltype(__c.size())' (aka 'unsigned long'))

## Category
Rewriter needs to handle `kEncryptedMediaInitData.data() + std::size(kEncryptedMediaInitData))` as is because the formula is valid but hard to parse.

## Reason
The expression `kEncryptedMediaInitData.data() + std::size(kEncryptedMediaInitData))` is not well supported since the rewriter could not find the right code to replace it with.

## Solution
Rewriter can choose to ignore and not rewrite pointer arithmetic expressions with iterator and size and just use the pointers.

```
  std::vector<uint8_t>(
-                                 kEncryptedMediaInitData.data(),
-                                  kEncryptedMediaInitData +
-                                      std::size(kEncryptedMediaInitData))))
+                                 kEncryptedMediaInitData.data(),
+                                 kEncryptedMediaInitData.data() +
+                                      kEncryptedMediaInitData.size()))