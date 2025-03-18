# Build Failure Analysis: 2025_03_14_patch_953

## First error

../../net/disk_cache/backend_unittest.cc:510:25: error: no viable conversion from 'std::array<char, 30>' to 'const std::string' (aka 'const basic_string<char>')

## Category
Rewriter needs to add .data() to arrayified `char[]` variable used with std::string.

## Reason
The rewriter converted a `char[]` to `std::array<char, 30>`, but the `OpenEntry` function expects a `const std::string&`.  The `std::array` does not have an implicit conversion to `std::string`, so the rewriter should have added `.data()` to the `buffer` variable when passing it to `OpenEntry`.

## Solution
The rewriter should recognize this pattern (passing a `std::array<char, N>` to a function expecting a `const std::string&`) and add `.data()` to the variable.

## Note
The second error is similar, related to `buffer + 1` not being implicitly convertible to `std::string`.
The third error is also related to adding an integer to a std::array.
The fourth error is a `no matching function for call to strict_cast`, this is happening because base::strlcpy calls base::checked_cast.