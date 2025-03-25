# Build Failure Analysis: 2025_03_19_patch_1437

## First error

../../components/viz/test/gl_scaler_test_util.cc:210:32: error: no viable conversion from 'uint32_t *' (aka 'unsigned int *') to 'const base::span<uint32_t>' (aka 'const span<unsigned int>')
  210 |     const base::span<uint32_t> pixels = image->getAddr32(0, y);
      |                                ^        ~~~~~~~~~~~~~~~~~~~~~~

## Category
Rewriter needs to generate code to construct a span from the return value of a third_party function.

## Reason
The code is trying to assign the result of `image->getAddr32(0, y)` to a `base::span<uint32_t>`.  `image->getAddr32(0, y)` is a third_party function call from Skia and it returns a raw `uint32_t*`. The rewriter needs to generate code to construct a `base::span` from the return value of the third_party function `SkBitmap::getAddr32` and it failed to do so. The error message indicates that there is no viable conversion from `uint32_t*` to `const base::span<uint32_t>`.

## Solution
The rewriter needs to construct a span from the return value, but the size is hard to identify. SkBitmap::getAddr32 returns a pointer to the pixel data of a row in the bitmap.  The length of the row would be image->width().

```c++
const base::span<uint32_t> pixels = base::span<uint32_t>(image->getAddr32(0, y), image->width());
```

## Note
`SkBitmap::getAddr32()` is third party code, so the rewriter cannot change its return type.