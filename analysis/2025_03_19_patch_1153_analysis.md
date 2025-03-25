# Build Failure Analysis: 1171

## First error

../../net/spdy/fuzzing/hpack_fuzz_util_test.cc:146:32: error: member reference base type 'char[21]' is not a structure or union

## Category
Rewriter added .data() to a variable/member it did not spanify/arrayify.

## Reason
The rewriter is adding `.data()` to `buffer` in the line `std::string unmodified(buffer.data(), std::size(buffer) - 1);`.  However, `buffer` is a C-style array, not a span or std::array. The rewriter logic incorrectly assumed that `buffer` had been converted to a span or array.

## Solution
The rewriter should only add `.data()` to variables that it has spanified or arrayified. This likely indicates a bug in the rewriter's logic for adding `.data()`. Review and fix the rewriter logic to avoid this incorrect transformation.

## Note
The second error `../../net/spdy/fuzzing/hpack_fuzz_util_test.cc:148:31: error: member reference base type 'char[21]' is not a structure or union` appears to be a consequence of the first. The third error, however, is different.

The third error `../../net/spdy/fuzzing/hpack_fuzz_util_test.cc:149:27: error: no viable conversion from 'uint8_t *' (aka 'unsigned char *') to 'base::span<uint8_t>' (aka 'span<unsigned char>`). This means rewriter failed to recognize raw pointer passed to spanified function.`