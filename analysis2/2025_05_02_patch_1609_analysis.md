# Build Failure Analysis: 2025_05_02_patch_1609

## First error

../../net/filter/brotli_source_stream_unittest.cc:306:27: error: no viable conversion from 'std::array<char, kDefaultBufferSize>' to 'const char *'
  306 |   source()->AddReadResult(corrupt_data, corrupt_data_len, OK,
      |                           ^~~~~~~~~~~~

## Category
Rewriter needs to add .data() when converting a C-style array to std::array in a third_party function call.

## Reason
The code was rewritten to use `std::array` instead of a C-style array for `corrupt_data`. The `AddReadResult` function in `MockSourceStream` expects a `const char*` as its first argument. The rewriter did not add `.data()` to the `corrupt_data` argument when calling `AddReadResult`, resulting in a type mismatch.

## Solution
The rewriter should recognize that `corrupt_data` has been converted to `std::array` and that the `AddReadResult` function expects a `const char*`. The rewriter should automatically append `.data()` to the `corrupt_data` argument, so that the call becomes `source()->AddReadResult(corrupt_data.data(), corrupt_data_len, OK,`.

## Note
The `AddReadResult` function seems to be part of the test code in `net/filter/mock_source_stream.h`. The rewriter needs to correctly handle cases where a converted `std::array` is passed to a function expecting a `const char*`.