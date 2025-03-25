# Build Failure Analysis: 2025_03_19_patch_872

## First error

../../cc/paint/oop_pixeltest.cc:2864:23: error: no viable conversion from 'uint8_t *' (aka 'unsigned char *') to 'base::span<uint8_t>' (aka 'span<unsigned char>')

## Category
Rewriter needs to generate code to construct a span from a raw pointer.

## Reason
The rewriter converted `uint8_t* uv_pix` into `base::span<uint8_t> uv_pix`. However, the code `static_cast<uint8_t*>(uv_bitmap.getPixels())` returns a raw pointer, which cannot be directly assigned to a `base::span`. The rewriter needs to generate code to construct a `base::span` from the raw pointer and size information. In this case, the size is obtainable from `uv_bitmap.computeByteSize()`.

## Solution
The rewriter should generate code to construct a `base::span` with the size. Here's the suggested code:

```c++
   base::span<uint8_t> uv_pix(static_cast<uint8_t*>(uv_bitmap.getPixels()), uv_bitmap.computeByteSize());
```

## Note
The rewriter needs to be able to deduce the size of a bitmap when constructing a span from `bitmap.getPixels()`. It could use `bitmap.computeByteSize()` or similar methods.