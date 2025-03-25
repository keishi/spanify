# Build Failure Analysis: 2025_03_19_patch_135

## First error

../../services/tracing/public/cpp/perfetto/traced_value_proto_writer_unittest.cc:223:25: error: no viable conversion from 'std::array<char, 4096>' to 'std::string_view' (aka 'basic_string_view<char>')

## Category
Rewriter needs to add .data() to arrayified `char[]` variable used with std::string.

## Reason
The code attempts to pass a `std::array<char, 4096>` (kLongString3) directly to the `SetString` method, which expects a `std::string_view`. The rewriter converted `kLongString3` from `char[]` to `std::array<char, 4096>`, but did not add `.data()` to it, causing the conversion error.

## Solution
The rewriter should automatically add `.data()` when a spanified `char[]` (now a `std::array<char, SIZE>`) is used in a context expecting a `std::string_view`.

## Note
There is a second error which indicates that the arguments were also not compatible with the IsValue() function. This is likely a separate and related issue.