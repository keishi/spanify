# Build Failure Analysis: 2025_03_14_patch_70

## First error

../../base/i18n/streaming_utf8_validator_unittest.cc:135:38: error: no matching function for call to 'end'
  135 | const char* const* const valid_end = std::end(valid.data());
      |                                      ^~~~~~~~

## Category
Rewriter needs to account for `std::to_array` when generating the `std::end` iterator

## Reason
The rewriter converted the raw C-style array `valid` into a `std::array`, so the `std::end` function must be called on the `std::array` object directly, not on the result of `.data()`. The error message indicates that there are no matching `end` functions when calling it with a `const value_type *`.

## Solution
When rewriting raw C-style arrays to `std::array` with a `std::end` iterator, the rewriter must remove the call to `.data()`.
For example:
```c++
-const char* const* const valid_end = std::end(valid.data());
+const char* const* const valid_end = std::end(valid);
```

## Note
There are also other errors that result from this issue.
```
../../base/i18n/streaming_utf8_validator_unittest.cc:323:3: error: no matching member function for call to 'CheckRange'
  323 |   CheckRange(valid, valid_end, VALID_ENDPOINT);
      |   ^~~~~~~~~~
../../base/i18n/streaming_utf8_validator_unittest.cc:238:8: note: candidate template ignored: deduced conflicting types for parameter 'Iterator' ('array<remove_cv_t<const char *>, 7UL>' (aka 'array<const char *, 7UL>') vs. 'const char *const *')
  238 |   void CheckRange(Iterator begin,
      |        ^
../../base/i18n/streaming_utf8_validator_unittest.cc:335:3: error: no matching member function for call to 'CheckRangeByteAtATime'
  335 |   CheckRangeByteAtATime(valid, valid_end, VALID_ENDPOINT);
      |   ^~~~~~~~~~~~~~~~~~~~~
../../base/i18n/streaming_utf8_validator_unittest.cc:251:8: note: candidate template ignored: deduced conflicting types for parameter 'Iterator' ('array<remove_cv_t<const char *>, 7UL>' (aka 'array<const char *, 7UL>') vs. 'const char *const *')
  251 |   void CheckRangeByteAtATime(Iterator begin,
      |        ^
../../base/i18n/streaming_utf8_validator_unittest.cc:348:3: error: no matching member function for call to 'CheckCombinations'
  348 |   CheckCombinations(valid, valid_end, valid, valid_end, VALID_ENDPOINT);
      |   ^~~~~~~~~~~~~~~~~
../../base/i18n/streaming_utf8_validator_unittest.cc:273:8: note: candidate template ignored: deduced conflicting types for parameter 'Iterator1' ('array<remove_cv_t<const char *>, 7UL>' (aka 'array<const char *, 7UL>') vs. 'const char *const *')
  273 |   void CheckCombinations(Iterator1 begin1,
      |        ^
../../base/i18n/streaming_utf8_validator_unittest.cc:352:3: error: no matching member function for call to 'CheckCombinations'
  352 |   CheckCombinations(valid, valid_end, PartialIterator(), PartialIterator::end(),
      |   ^~~~~~~~~~~~~~~~~
../../base/i18n/streaming_utf8_validator_unittest.cc:273:8: note: candidate template ignored: deduced conflicting types for parameter 'Iterator1' ('array<remove_cv_t<const char *>, 7UL>' (aka 'array<const char *, 7UL>') vs. 'const char *const *')
  273 |   void CheckCombinations(Iterator1 begin1,
      |        ^
../../base/i18n/streaming_utf8_validator_unittest.cc:357:3: error: no matching member function for call to 'CheckCombinations'
  357 |   CheckCombinations(PartialIterator(), PartialIterator::end(), valid, valid_end,
      |   ^~~~~~~~~~~~~~~~~
../../base/i18n/streaming_utf8_validator_unittest.cc:273:8: note: candidate template ignored: deduced conflicting types for parameter 'Iterator2' ('array<remove_cv_t<const char *>, 7UL>' (aka 'array<const char *, 7UL>') vs. 'const char *const *')
  273 |   void CheckCombinations(Iterator1 begin1,
      |        ^
../../base/i18n/streaming_utf8_validator_unittest.cc:367:3: error: no matching member function for call to 'CheckCombinations'
  367 |   CheckCombinations(valid, valid_end, invalid, invalid_end, INVALID);
      |   ^~~~~~~~~~~~~~~~~
../../base/i18n/streaming_utf8_validator_unittest.cc:273:8: note: candidate template ignored: deduced conflicting types for parameter 'Iterator1' ('array<remove_cv_t<const char *>, 7UL>' (aka 'array<const char *, 7UL>') vs. 'const char *const *')
  273 |   void CheckCombinations(Iterator1 begin1,
      |        ^
../../base/i18n/streaming_utf8_validator_unittest.cc:371:3: error: no matching member function for call to 'CheckCombinations'
  371 |   CheckCombinations(invalid, invalid_end, valid, valid_end, INVALID);
      |   ^~~~~~~~~~~~~~~~~
../../base/i18n/streaming_utf8_validator_unittest.cc:273:8: note: candidate template ignored: deduced conflicting types for parameter 'Iterator2' ('array<remove_cv_t<const char *>, 7UL>' (aka 'array<const char *, 7UL>') vs. 'const char *const *')
  273 |   void CheckCombinations(Iterator1 begin1,
      |        ^