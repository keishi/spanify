# Build Failure Analysis: 2025_05_02_patch_1386

## First error
../../chrome/browser/safe_browsing/download_protection/deep_scanning_request_unittest.cc:858:21: error: no viable conversion from 'const std::array<char, 8>' to 'const std::string' (aka 'const basic_string<char>')

## Category
Rewriter needs to add .data() to arrayified `char[]` variable used with std::string.

## Reason
The rewriter converted a `constexpr char kScanId[]` to `constexpr std::array<char, 8> kScanId`. The code attempts to use this array as a `std::string`. A `std::array` does not implicitly convert to a `std::string`. However, C-style arrays do. The rewriter needs to add `.data()` to the variable.

## Solution
The rewriter should add `.data()` to the converted `std::array` when it is being used as a `std::string`.

```c++
-       const std::string& expected_scan_id,
+       const std::string& expected_scan_id,
```

```c++
-       /*scan_id*/ kScanId,
+       /*scan_id*/ kScanId.data(),
```

## Note
The `StrCat` errors are another instance of the same underlying problem as the `ContentAnalysisResponse::set_request_token` error: the rewriter has converted a C-style array to `std::array`, but the code expects a `std::string` or something convertible to a `std::string`.