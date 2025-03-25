# Build Failure Analysis: 2025_03_19_patch_1718

## First error
../../net/filter/brotli_source_stream_unittest.cc:306:27: error: no viable conversion from 'std::array<char, kDefaultBufferSize>' to 'const char *'

## Category
Rewriter encountered a case where it failed to add .data() when converting a C-style array to std::array in a third_party function call.

## Reason
The rewriter transformed `char corrupt_data[kDefaultBufferSize];` into `std::array<char, kDefaultBufferSize> corrupt_data;`, but failed to update the call site `source()->AddReadResult(corrupt_data, corrupt_data_len, OK,`. The `AddReadResult` function expects a `const char*`, but the rewriter did not add `.data()` to the `corrupt_data` argument.

## Solution
The rewriter needs to add `.data()` to arrayified `char[]` variable used with third party functions.

## Note
The first error occurs at line 306.