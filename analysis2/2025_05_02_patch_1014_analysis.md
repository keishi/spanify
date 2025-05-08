# Build Failure Analysis: 2025_05_02_patch_1014

## First error

../../third_party/blink/renderer/core/inspector/inspector_dom_debugger_agent.cc:648:61: error: invalid operands to binary expression ('const std::string_view' (aka 'const basic_string_view<char>') and 'const String')

## Category
Rewriter needs to add .data() to arrayified `char[]` variable used with std::string.

## Reason
The rewriter converted `const char kListenerEventCategoryType[]` to `const std::string_view kListenerEventCategoryType`. The original code was concatenating a char array with a `String` object. However, converting the char array to `std::string_view` broke the concatenation because there is no `operator+` defined for `std::string_view` and `String`.

## Solution
The rewriter should recognize this pattern and add `.data()` when concatenating with `String`.

## Note