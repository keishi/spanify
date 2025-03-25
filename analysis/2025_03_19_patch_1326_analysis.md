# Build Failure Analysis: 2025_03_19_patch_1326

## First error

../../chrome/browser/apps/icon_standardizer_unittest.cc:47:23: error: no viable conversion from 'SkColor *' (aka 'unsigned int *') to 'base::span<SkColor>' (aka 'span<unsigned int>')

## Category
Rewriter needs to avoid using reinterpret_cast on spanified variable.

## Reason
The rewriter spanified the variable `src_color`, but left a reinterpret_cast that is applied to the result of third_party code `bitmap.getAddr32(0, y)`. The compiler cannot implicitly convert `SkColor*` to `base::span<SkColor>`.

## Solution
The rewriter needs to be able to either modify the type returned by bitmap.getAddr32 or be able to construct a span. The easiest fix for the rewriter would be to recognize this pattern and rewrite the code to `base::span<SkColor>((SkColor*)bitmap.getAddr32(0, y), bitmap.width())`.

## Note
The span constructor is not marked `UNSAFE_BUFFERS` here, but it should be for this type of variable.