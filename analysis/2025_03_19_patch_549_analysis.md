# Build Failure Analysis: 2025_03_19_patch_549

## First error

../../media/formats/webm/webm_crypto_helpers_unittest.cc:248:31: error: invalid operands to binary expression ('const array<remove_cv_t<unsigned char>, 16UL>' (aka 'const array<unsigned char, 16UL>') and 'unsigned long')
  248 |                   kExpectedIv + (kExpectedIv.size() *
      |                   ~~~~~~~~~~~ ^ ~~~~~~~~~~~~~~~~~~~~~
  249 |                                  sizeof(decltype(kExpectedIv)::value_type))),
      |                                  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

## Category
Overlapping replacements between AppendDataCall and AppendDataCall.

## Reason
The rewriter has two overlapping replacements. The first is for the entire expression: `(kExpectedIv.size() * sizeof(decltype(kExpectedIv)::value_type))`, and the second is an attempt to add `.data()` to `kExpectedIv`. It is adding `.data` to the array variable but also trying to get the size by pointer arithmetic.

## Solution
The rewriter should not attempt to rewrite array size calculations when the array is converted to std::array.