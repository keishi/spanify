# Build Failure Analysis: 2025_03_14_patch_9

## First error

../../third_party/abseil-cpp/absl/strings/internal/str_format/arg.h:431:31: error: no matching function for call to 'FormatConvertImpl'

## Category
Rewriter encountered a case where it failed to add .data() when converting a C-style array to std::array in a third_party function call.

## Reason
The rewriter converted `kManifestParseError` from a C-style array (`char[]`) to a `std::array`. However, the rewriter did not append `.data()` when passing it as an argument to `base::StringPrintf`. The `absl::FormatSpec` class is not compatible with `std::array` without calling `.data()`.

## Solution
The rewriter should detect when a `std::array` is passed to a function like `base::StringPrintf` that expects a `char*` and automatically append `.data()` to the `std::array` variable.

## Note
This is similar to "Rewriter needs to add .data() to `char[]` converted to std::array passed to `base::StringPrintf`." However, the rewriter needs to perform this fix for third-party code.