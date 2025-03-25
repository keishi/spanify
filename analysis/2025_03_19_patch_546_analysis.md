# Build Failure Analysis: 2025_03_19_patch_546

## First error

../../third_party/abseil-cpp/absl/strings/internal/str_format/arg.h:431:31: error: no matching function for call to 'FormatConvertImpl'
  431 |   using ConvResult = decltype(str_format_internal::FormatConvertImpl(
      |                               ^~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

## Category
Rewriter needs to add .data() to `char[]` converted to std::array passed to `base::StringPrintf`.

## Reason
The rewriter converted `kManifestParseError` from a `char[]` to `std::array<char, 28>`. However, `base::StringPrintf` expects a `const char*` as input. The compiler error indicates that there is no matching `FormatConvertImpl` function that can handle the `std::array<char, 28>`. The rewriter needs to add `.data()` to `kManifestParseError` when it is passed to `base::StringPrintf`.

## Solution
The rewriter should identify cases where a `std::array<char, SIZE>` is passed to a function expecting `const char*` and automatically add `.data()` to the `std::array` variable name.

In `extensions/common/file_util_unittest.cc`, the rewriter should change:
```c++
-        error.find(manifest_errors::kManifestParseError +
+        error.find(manifest_errors::kManifestParseError.data() +
```
to:
```c++
-        error.find(manifest_errors::kManifestParseError.data() +
+        error.find(manifest_errors::kManifestParseError.data() +
```

## Note
Both errors are related to this same root cause.