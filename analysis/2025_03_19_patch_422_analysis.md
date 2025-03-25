# Build Failure Analysis: 2025_03_19_patch_422

## First error

../../url/url_canon_ip.cc:128:5: error: no matching function for call to '_itoa_s'

## Category
Rewriter needs to add .data() to `char[]` converted to std::array passed to `base::StringPrintf`.

## Reason
The code was converted to use `std::array<char, 16> str;` instead of `char str[16];`. The function `_itoa_s` expects a `char*` as the second argument, but it is receiving a `std::array<char, 16>`. The rewriter should have added `.data()` to the `str` variable, since it knows that it changed a c-style array to a `std::array`, and that the `_itoa_s` function was expecting a `char*`.

## Solution
The rewriter should add `.data()` when `std::array` variable is passed to `_itoa_s`.

## Note
`_itoa_s` is a Microsoft function. The Chromium code is likely including `<stdlib.h>` or a similar header and using `_itoa_s` directly, rather than using a Chromium abstraction.