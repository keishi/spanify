# Build Failure Analysis: 2025_03_19_patch_1971

## First error

../../media/filters/ffmpeg_demuxer_unittest.cc:536:64: error: invalid operands to binary expression ('const array<remove_cv_t<unsigned char>, 16UL>' (aka 'const array<unsigned char, 16UL>') and 'decltype(__c.size())' (aka 'unsigned long'))

## Category
Rewriter needs to avoid using pointer arithmetic on arrayified variable.

## Reason
The rewriter replaced `kEncryptedMediaInitData` with `std::array`, but failed to update the pointer arithmetic used to pass the array to `std::vector`'s constructor, which requires raw pointers.

## Solution
Replace the pointer arithmetic with `.data()`.
```cpp
-                                       kEncryptedMediaInitData +
+                                       kEncryptedMediaInitData.data() +
```

## Note
The code passes `kEncryptedMediaInitData.data() + std::size(kEncryptedMediaInitData))`, which is equivalent to pointer arithmetic. The rewriter should know that if the first argument is `.data()`, then the second argument should be `.size()` instead of pointer arithmetic.