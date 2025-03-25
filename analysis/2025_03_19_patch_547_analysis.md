# Build Failure Analysis: 2025_03_19_patch_547

## First error
../../media/formats/webm/webm_crypto_helpers_unittest.cc:215:31: error: invalid operands to binary expression ('const array<remove_cv_t<unsigned char>, 16UL>' (aka 'const array<unsigned char, 16UL>') and 'unsigned long')
  215 |                   kExpectedIv + (kExpectedIv.size() *

## Category
Rewriter failed to apply subspan rewrite to a spanified return value.

## Reason
The rewriter spanified `kExpectedIv`, but it is being used in an expression that calculates a pointer. The size of `kExpectedIv` is already known, so the intention was to add `.data()` to `kExpectedIv`, then perform pointer arithmetic on the resulting pointer. But the rewriter incorrectly used operator+, which isn't compatible with std::array.

## Solution
When `data()` was spanified, the rewriter failed to add `.data()` to `kExpectedIv`. The rewriter needs to be updated to add .data() to the spanified array when doing pointer arithmetic.

## Note
It appears there are other places where pointer arithmetic might be done on spanified array.