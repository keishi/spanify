# Build Failure Analysis: 2025_03_19_patch_1019

## First error

../../components/media_router/common/media_source.cc:50:6: error: no viable conversion from 'const std::array<char, 5>' to 'const char *const'

## Category
Rewriter failed to add .data() to `char[]` converted to std::array passed to `base::StringPrintf`.

## Reason
The rewriter is converting `char[]` to `std::array`. This is passed to a function that expected `char*`. The rewriter should recognize this pattern and add .data().

## Solution
The rewriter should add `.data()` when passing a `char[]` converted to `std::array` to a function that expects a `char*`.

## Note
Extra errors found:
*   ../../components/media_router/common/media_source.cc:166:24: error: no viable conversion from 'const std::array<char, 5>' to 'std::string_view' (aka 'basic_string_view<char>')