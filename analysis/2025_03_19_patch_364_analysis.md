# Build Failure Analysis: 2025_03_19_patch_364

## First error

../../chrome/browser/ui/views/webid/account_selection_bubble_view_unittest.cc:163:9: error: no viable conversion from 'const std::array<char, 7>' to 'const std::string' (aka 'const basic_string<char>')
  163 |         kAccountSuffix, idp_data_, login_state);
      |         ^~~~~~~~~~~~~~

## Category
Rewriter needs to add .data() to arrayified `char[]` variable used with std::string.

## Reason
The original code was concatenating a `char[]` with a `std::string` which worked fine. However, the rewriter converted the `char[]` to `std::array<char, 7>` without adding `.data()` when that variable is used with std::string. This caused the compilation error because there is no implicit conversion from `std::array<char, 7>` to `std::string`.

## Solution
The rewriter should recognize this pattern and add `.data()` to the spanified variable.

## Note
There are additional errors of the same kind.
Also, there is another error where after converting to std::array, the rewriter needs to add ".data()" on top of a subspan variable.