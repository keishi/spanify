# Build Failure Analysis: 2025_03_19_patch_1719

## First error

../../net/filter/brotli_source_stream_unittest.cc:338:27: error: no viable conversion from 'std::array<char, kDefaultBufferSize>' to 'const char *'
  338 |   source()->AddReadResult(corrupt_data, corrupt_data_len, OK,

## Category
Rewriter failed to add .data() when converting a C-style array to std::array in a third_party function call.

## Reason
The code was converted to use `std::array` for `corrupt_data`. However, the `AddReadResult` function in `MockSourceStream` expects a `const char*`, and the rewriter did not automatically add `.data()` to the `corrupt_data` argument when calling `AddReadResult`.

## Solution
The rewriter should recognize when a `char[]` is converted to `std::array` and add `.data()` when that variable is passed to a function expecting a `const char*`. In this case, `corrupt_data` should be replaced with `corrupt_data.data()` in the function call.

## Note
The error occurs at line 338 in `net/filter/brotli_source_stream_unittest.cc`, where `corrupt_data` is passed to `source()->AddReadResult`.
The corresponding function declaration is in `net/filter/mock_source_stream.h`:
`void AddReadResult(const char* data, int len, Error error, Mode mode);`.