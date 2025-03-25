# Build Failure Analysis: 2025_03_19_patch_1158

## First error

../../chrome/browser/apps/icon_standardizer.cc:116:25: error: no viable conversion from 'SkColor *' (aka 'unsigned int *') to 'base::span<SkColor>' (aka 'span<unsigned int>')
  116 |     base::span<SkColor> preview_color =

## Category
Rewriter needs to generate code to construct a span from the return value of a third_party function.

## Reason
The rewriter changed `SkColor* preview_color` to `base::span<SkColor> preview_color`. However, the code assigns the raw pointer returned from `preview.getAddr32(0, y)` directly to the span. The compiler is complaining because there is no implicit conversion from `SkColor*` to `base::span<SkColor>`. The rewriter needs to generate code to explicitly construct a span from the raw pointer. The size information is missing since it is a return value of a third_party function.

## Solution
The rewriter should check if the raw pointer being assigned is a return value from a third party function, and construct a span from it with the size missing.

## Note
The code is calling `bitmap.getAddr32(0, y)` which returns a raw pointer. The rewriter should generate code to construct a span from the return value. However it does not have size information.