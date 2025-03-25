# Build Failure Analysis: 2025_03_19_patch_247

## First error

../../third_party/blink/renderer/core/page/scrolling/scrolling_test.cc:119:54: error: member reference base type 'const value_type *' (aka 'const char *') is not a structure or union
  119 |                                   kHttpBaseUrl.data().subspan(url_fragment));
      |                                   ~~~~~~~~~~~~~~~~~~~^~~~~~~~

## Category
Rewriter failed to apply subspan rewrite to a spanified return value.

## Reason
The code tries to chain `.subspan()` to the `.data()` result, but the rewriter did not apply .data() to the spanified return value of the function.

## Solution
The rewriter should add `.data()` when subspan is called on the spanified return value.

## Note
The second error indicates `WebString::FromUTF8` expects a `std::string_view`, but receives `std::array<char, 21>`. This suggests the rewriter didn't correctly add `.data()` when passing the array to the function.