# Build Failure Analysis: 2025_03_19_patch_60

## First error

../../ui/base/clipboard/clipboard_test_template.h:614:28: error: no viable conversion from 'const U8x4 *' (aka 'const array<unsigned char, 4> *') to 'base::span<const U8x4>' (aka 'span<const array<unsigned char, 4>>')

## Category
Rewriter failing to recognize raw pointer passed to spanified function.

## Reason
The code fails to compile because the rewriter converted the U8x4 variable to span, but the getAddr32() call returns a raw pointer which cannot be implicitly converted to span. The code also fails to add `.data()` to fix this. This is third party code, so it should not be rewritten.

## Solution
The rewriter needs to check for the case where third_party code returns a raw pointer, but it is being assigned to a spanified variable. In this case, the rewriter needs to generate code to construct a span from the return value of the third_party function. 

## Note
Also check for SkBitmap::getAddr32() in other places.