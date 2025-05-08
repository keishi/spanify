# Build Failure Analysis: 2025_05_02_patch_62

## First error

../../components/webcrypto/fuzzer_support.cc:114:9: error: cannot increment value of type 'base::span<const uint8_t>' (aka 'span<const unsigned char>')

## Category
Rewriter needs to avoid spanifying functions if it requires spanifying excluded code.

## Reason
The function `ImportEcKeyFromRawFuzzData` was spanified. But the body of the function increments the `data` variable. This is no longer possible because it is a span. The fix would require spanifying all call sites to `ImportEcKeyFromRawFuzzData`. But that may not be possible because they may be in third party code. Thus the function should not have been spanified.

## Solution
The rewriter should not spanify the function `ImportEcKeyFromRawFuzzData` because it requires rewriting call sites that may be excluded from rewriting.

## Note