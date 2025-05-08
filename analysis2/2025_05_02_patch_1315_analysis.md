# Build Failure Analysis: 2025_05_02_patch_1315

## First error

../../third_party/blink/renderer/core/css/parser/css_property_parser.cc:390:35: error: no matching function for call to 'FindValue'
  390 |   const Value* hash_table_entry = FindValue(buffer, length);
      |                                   ^~~~~~~~~
../../third_party/blink/renderer/core/css/hash_tools.h:46:14: note: candidate function not viable: no known conversion from 'std::array<char, kMaxCSSValueKeywordLength>' to 'const char *' for 1st argument
   46 | const Value* FindValue(const char* str, unsigned len);
      |              ^         ~~~~~~~~~~~~~~~

## Category
Rewriter needs to add .data() to arrayified `char[]` variable used with third_party function.

## Reason
The rewriter converted `char buffer[kMaxCSSValueKeywordLength]` to `std::array<char, kMaxCSSValueKeywordLength> buffer;`, but the function `FindValue` expects `const char*` as an argument. The rewriter should add `.data()` to `buffer` when calling `FindValue`.

## Solution
The rewriter should recognize this pattern and add `.data()` to `buffer` when calling `FindValue`.

## Note
There are multiple errors because the rewriter didn't add `.data()` in multiple places.