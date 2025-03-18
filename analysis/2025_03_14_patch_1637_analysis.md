# Build Failure Analysis: 2025_03_14_patch_1637

## First error

../../content/web_test/renderer/test_plugin.cc:192:58: error: member reference base type 'uint8_t[3]' (aka 'unsigned char[3]') is not a structure or union

## Category
Rewriter needs to add `.data()` when spanifying functions with array members.

## Reason
The error arises because the `ParseColor` function was spanified, however the `scene_.background_color` and `scene_.primitive_color` are array members not spans. Thus the compiler expects a member access with `.` and is receiving a call using `->` on `data()`. The rewriter needs to insert `.data()` to adapt function calls. This reveals that there's a call to a spanified function which receives an array, which used to work because the function took a pointer, but now requires `.data()`.

## Solution
The rewriter should detect when an array member is being passed to a spanified function, and add `.data()` when needed.

The corrected code will be like this:

```c++
      ParseColor(attribute_value, scene_.background_color.data());