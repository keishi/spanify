# Build Failure Analysis: 2025_03_14_patch_1653

## First error

../../chrome/browser/safe_browsing/download_protection/deep_scanning_request_unittest.cc:857:21: error: no viable conversion from 'const std::array<char, 8>' to 'const std::string' (aka 'const basic_string<char>')
  857 |         /*scan_id*/ kScanId,
      |                     ^~~~~~~

## Category
Rewriter needs to add .data() to arrayified `char[]` variable used with std::string.

## Reason
The code is trying to implicitly convert `std::array<char, 8>` to `std::string`, which is not allowed. The fix is to use the `.data()` method to convert it to a `const char*`. There are multiple errors of this type, but we classify the first only.

## Solution
The rewriter should add `.data()` to arrayified `char[]` variables used where `std::string` is expected.

## Note
There are several other errors similar to the first one. Also, `base::StrCat` is failing, and there's an additional error later when the code expects `std::optional<std::string>`. This might be third party code or the conversion from `char[]` to `optional<string>` might be something the rewriter should handle.