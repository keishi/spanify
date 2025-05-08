# Build Failure Analysis: 2025_05_02_patch_1411

## First error

../../url/url_canon_ip.h:458:32: error: no matching function for call to 'StringToUint64WithBase'

## Category
Rewriter needs to add .data() to arrayified `char[]` variable used with std::string.

## Reason
The rewriter converted `char buf[5]` to `std::array<char, 5> buf;`, but `StringToUint64WithBase` expects a `std::string_view`. The rewriter should recognize this pattern and add `.data()` to adapt `std::array` to `std::string_view`.

## Solution
The rewriter should be changed to automatically add `.data()` when a `std::array<char, N>` variable is passed to a function expecting a `std::string_view`.
```
# Build Failure Analysis: 2025_05_02_patch_1411

## First error

../../url/url_canon_ip.h:458:32: error: no matching function for call to 'StringToUint64WithBase'

## Category
Rewriter needs to add .data() to arrayified `char[]` variable used with std::string.

## Reason
The rewriter converted `char buf[5]` to `std::array<char, 5> buf;`, but `StringToUint64WithBase` expects a `std::string_view`. The rewriter should recognize this pattern and add `.data()` to adapt `std::array` to `std::string_view`.

## Solution
The rewriter should be changed to automatically add `.data()` when a `std::array<char, N>` variable is passed to a function expecting a `std::string_view`.