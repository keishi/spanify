# Build Failure Analysis: 2025_03_19_patch_833

## First error

../../base/i18n/streaming_utf8_validator_unittest.cc:135:38: error: no matching function for call to 'end'
  135 | const char* const* const valid_end = std::end(valid.data());
      |                                      ^~~~~~~~

## Category
Rewriter needs to handle address of a spanified variable passed into a function.

## Reason
The rewriter converted `valid` from a C-style array to `std::array`. It then attempted to call `std::end` on `valid.data()`. However, `std::end` expects an array type, not a pointer. The type of `valid.data()` is `const char* const*`, which does not match the expected argument type of `std::end`.

## Solution
The rewriter needs to avoid spanifying `valid` as it's address is being passed to a function, which does not support `span`.

## Note
There are a lot of similar errors after the first one, all related to the same problem. Fixing the first issue should resolve them all.
```
../../base/i18n/streaming_utf8_validator_unittest.cc:323:3: error: no matching member function for call to 'CheckRange'
../../base/i18n/streaming_utf8_validator_unittest.cc:335:3: error: no matching member function for call to 'CheckRangeByteAtATime'
../../base/i18n/streaming_utf8_validator_unittest.cc:348:3: error: no matching member function for call to 'CheckCombinations'
../../base/i18n/streaming_utf8_validator_unittest.cc:352:3: error: no matching member function for call to 'CheckCombinations'
../../base/i18n/streaming_utf8_validator_unittest.cc:357:3: error: no matching member function for call to 'CheckCombinations'
../../base/i18n/streaming_utf8_validator_unittest.cc:367:3: error: no matching member function for call to 'CheckCombinations'
../../base/i18n/streaming_utf8_validator_unittest.cc:371:3: error: no matching member function for call to 'CheckCombinations'