# Build Failure Analysis: 2025_03_14_patch_1237

## First error

../../components/feedback/redaction_tool/url_canon_ip.cc:561:5: error: no matching function for call to '_itoa_s'
  561 |     _itoa_s(address[i], str, 10);

## Category
Rewriter needs to consider argument types when calling functions.

## Reason
The rewriter changed `char str[16]` to `std::array<char, 16> str;`. The function `_itoa_s` has an overload for `char (&buffer)[N]`, but not for `std::array<char, 16>`.
The rewriter should add `.data()` when passing a `std::array` to a function that expects a `char*` or `char[]`.

## Solution
The rewriter needs to add `.data()` to the `str` argument in the call to `_itoa_s`. The corrected code should be:
```c++
_itoa_s(address[i], str.data(), 10);
```

## Note
The include `std::array` should be added conditionally with a matcher to avoid syntax errors in C code.
```cpp
#ifdef __cpp_lib_array
#include <array>
#endif