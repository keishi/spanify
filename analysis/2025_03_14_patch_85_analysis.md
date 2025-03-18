# Build Failure Analysis: 2025_03_14_patch_85

## First error

../../chrome/browser/ui/views/webid/account_selection_bubble_view_unittest.cc:163:9: error: no viable conversion from 'const std::array<char, 7>' to 'const std::string' (aka 'const basic_string<char>')

## Category
Rewriter needs to handle `char[]` converted to `std::array` variable used with `std::string`.

## Reason
The rewriter converted a `char[]` to `std::array<char, N>`, however, the code is using that `std::array` variable in a context where a `std::string` is expected. The build failure shows an error indicating "no viable conversion from 'const std::array<char, 7>' to 'const std::string'". The compiler can't implicitly convert from `std::array` to `std::string` without an explicit `.data()` call.

## Solution
The rewriter should recognize when a `char[]` is converted to `std::array` and used in a context where a `std::string` is expected, and automatically insert `.data()` at the end of the `std::array` variable name to make the conversion explicit.

## Note
There are multiple errors of the same type in the build log.