# Build Failure Analysis: 2025_05_02_patch_1073

## First error

../../net/disk_cache/backend_unittest.cc:512:25: error: no viable conversion from 'std::array<char, 30>' to 'const std::string' (aka 'const basic_string<char>')

## Category
Rewriter needs to add .data() to arrayified `char[]` variable used with std::string.

## Reason
The `OpenEntry` function expects a `const std::string&` as its first argument, but the rewriter converted `buffer` from `char[]` to `std::array`, and the std::array cannot be implicitly converted to `std::string`.

## Solution
The rewriter should recognize this pattern and add .data() when a `char[]` converted to `std::array` is used with std::string.

## Note
Also, Rewriter needs to cast argument to base::span::subspan() to an unsigned value.