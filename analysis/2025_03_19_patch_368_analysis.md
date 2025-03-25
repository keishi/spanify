# Build Failure Analysis: 2025_03_19_patch_368

## First error

../../third_party/blink/renderer/core/css/parser/css_property_parser.cc:391:35: error: no matching function for call to 'FindValue'

## Category
Rewriter needs to add .data() to a `char[]` converted to std::array in a third_party function call.

## Reason
The rewriter converted `char buffer[kMaxCSSValueKeywordLength]` to `std::array<char, kMaxCSSValueKeywordLength> buffer;`. However, the `FindValue` function is a third_party function (in `third_party/blink/renderer/core/css/hash_tools.h`) that expects a `const char*` as input, and the rewriter failed to add `.data()` to the `std::array` when calling `FindValue`.

## Solution
The rewriter needs to add `.data()` to the `std::array` when calling `FindValue` to pass a `const char*` pointer.

## Note
There are other errors, but they are caused by the same root cause and will be fixed when this bug is fixed.