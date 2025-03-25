# Build Failure Analysis: 2025_03_19_patch_548

## First error

../../media/formats/webm/webm_crypto_helpers_unittest.cc:92:31: error: invalid operands to binary expression ('const array<remove_cv_t<unsigned char>, 16UL>' (aka 'const array<unsigned char, 16UL>') and 'unsigned long')
   92 |                   kExpectedIv + (kExpectedIv.size() *
      |                   ~~~~~~~~~~~ ^ ~~~~~~~~~~~~~~~~~~~~~

## Category
Rewriter failed to apply subspan rewrite to a spanified return value.

## Reason
`kExpectedIv` was arrayified, but it is being added with `kExpectedIv.size() * sizeof(decltype(kExpectedIv)::value_type)`. The compiler is complaining because the rewriter forgot to add `.data()` to `kExpectedIv` when performing addition.

## Solution
The rewriter should recognize that this is a variable that was arrayified, and add `.data()` to it to allow it to compile.

## Note
`data()` was spanified, the rewriter failed to add `.data()` to a spanified return value.
There is another error later. The compiler output has this error as well:
```
../../media/formats/webm/webm_crypto_helpers_unittest.cc:93:31: error: invalid operands to binary expression ('const array<remove_cv_t<unsigned char>, 16UL>' (aka 'const array<unsigned char, 16UL>') and 'unsigned long')
   93 |                  kExpectedIv + (kExpectedIv.size() *