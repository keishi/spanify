# Build Failure Analysis: 2025_05_02_patch_1610

## First error

../../net/filter/brotli_source_stream_unittest.cc:338:27: error: no viable conversion from 'std::array<char, kDefaultBufferSize>' to 'const char *'

## Category
Rewriter encountered a case where it failed to add .data() when converting a C-style array to std::array in a third_party function call.

## Reason
The rewriter converted `char corrupt_data[kDefaultBufferSize]` to `std::array<char, kDefaultBufferSize> corrupt_data;`. However, it did not add `.data()` when the variable `corrupt_data` was passed as an argument to `source()->AddReadResult`. The function `AddReadResult` expects a `const char*` as the first argument, but it received a `std::array<char, kDefaultBufferSize>`.

## Solution
The rewriter should add `.data()` when a variable of type `std::array` is passed to a function that expects a `const char*`.

## Note
N/A