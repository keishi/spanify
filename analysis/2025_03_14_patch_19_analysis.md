# Build Failure Analysis: 2025_03_14_patch_19

## First error

../../ui/gfx/skbitmap_operations.cc:47:26: error: no viable conversion from 'uint32_t *' (aka 'unsigned int *') to 'base::span<uint32_t>' (aka 'span<unsigned int>')

## Category
Rewriter needs to generate code to construct a span from the return value of a third_party function.

## Reason
The code attempts to assign the raw pointer returned by the third-party function `image.getAddr32(0, y)` directly to a `base::span<uint32_t>`.  `base::span` does not have an implicit conversion constructor that accepts a raw pointer and deduces the size. The rewriter needs to generate an explicit span construction.

## Solution
The rewriter should generate code to explicitly construct a `base::span` from the raw pointer and size. Because `SkBitmap::getAddr32` returns a raw pointer and span needs to know how large the array is, the size must be specified when creating the span.

```c++
base::span<uint32_t> image_row = base::span(image.getAddr32(0, y), image.width());
```

## Note
`SkBitmap::getAddr32` is third_party code from `Skia`.