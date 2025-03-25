```
# Build Failure Analysis: 2025_03_19_patch_152

## First error

../../chrome/browser/safe_browsing/download_protection/deep_scanning_request_unittest.cc:855:21: error: no viable conversion from 'const std::array<char, 8>' to 'const std::string' (aka 'const basic_string<char>')

## Category
Rewriter needs to add .data() to arrayified `char[]` variable used with std::string.

## Reason
The variable `kScanId` is converted to a `std::array<char, 8>`, and is used to build a std::string in `DeepScanningTestUtils::SimulateResponseForFile`:

```c++
  855 |         /*scan_id*/ kScanId,
```

There is a no viable conversion from `std::array` to `std::string`, so the rewriter should recognize this pattern and add `.data()`.

## Solution
The rewriter should recognize this pattern and add `.data()` to a arrayified `char[]` variable used with std::string.

```c++
       /*scan_id*/ kScanId.data(),
```

## Note
The error repeats in multiple locations, and is also happening when calling base::StrCat.
```
../../chrome/browser/safe_browsing/download_protection/deep_scanning_request_unittest.cc:1505:11: error: no matching function for call to 'StrCat'
 1505 |           base::StrCat({kScanId, base::NumberToString(i)}));
```
Rewriter needs to add .data() to `char[]` converted to std::array passed to `base::StringPrintf`.
The rewriter should recognize this pattern and add .data().