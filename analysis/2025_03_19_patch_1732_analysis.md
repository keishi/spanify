# Build Failure Analysis: 2025_03_19_patch_1732

## First error

../../ui/lottie/animation_unittest.cc:318:33: error: no viable conversion from 'SkColor *' (aka 'unsigned int *') to 'base::span<const SkColor>' (aka 'span<const unsigned int>')

## Category
Rewriter failing to recognize raw pointer passed to spanified variable.

## Reason
The code attempts to initialize a `base::span<const SkColor>` from `reinterpret_cast<SkColor*>(bitmap.getPixels())`. However, the compiler cannot implicitly convert a raw pointer (`SkColor*`) to a `base::span<const SkColor>`. The rewriter needs to generate proper code to create `base::span` from a raw pointer, but it seems like it failed to recognize this size info unavailable rhs value.

## Solution
The rewriter should be updated to properly handle cases where a raw pointer needs to be converted to a `base::span`. The rewriter should insert the size of bitmap to create the span correctly. Here's the corrected line the rewriter should have produced:

```c++
base::span<const SkColor> pixels(reinterpret_cast<SkColor*>(bitmap.getPixels()), bitmap.width() * bitmap.height());
```

## Note
The error message indicates that there is no viable constructor for `base::span` that accepts a raw pointer directly.