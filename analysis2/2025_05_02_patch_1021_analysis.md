# Build Failure Analysis: 2025_05_02_patch_1021

## First error

```
../../crypto/sha2_unittest.cc:81:3: error: no matching function for call to 'SHA256HashString'
```

## Category
Pointer passed into spanified function parameter.

## Reason
The function `crypto::SHA256HashString` expects a `void* output` as its second argument, but the rewriter converted `output2` to `std::array<uint8_t, crypto::kSHA256Length>`. Since there is no implicit conversion from `std::array` to `void*`, the compiler throws an error. The rewriter spanified a function parameter without spanifying all call sites.

## Solution
The rewriter should spanify the call site as well.

## Note
N/A