# Build Failure Analysis: 2025_03_19_patch_1054

## First error

../../ui/gfx/skbitmap_operations.cc:597:33: error: no viable conversion from 'uint32_t *' (aka 'unsigned int *') to 'base::span<const SkPMColor>' (aka 'span<const unsigned int>')

## Category
Rewriter failing to recognize raw pointer passed to spanified function.

## Reason
The function `SkBitmap::getAddr32` returns a raw pointer `SkPMColor*`. In the updated code, `cur_src0` and `cur_src1` are declared as `base::span<const SkPMColor>`. The compiler cannot implicitly convert the raw pointer to a `base::span`. This means that size information is unavailable to construct the span.

## Solution
The rewriter needs to detect the return value of `SkBitmap::getAddr32`, and construct a `span` with a specified size that can be passed into `base::span`. The rewriter can use `bitmap.width()` since this span represents one row of the image.

```c++
base::span<const SkPMColor> cur_src0 = 
    base::span<const SkPMColor>(bitmap.getAddr32(0, src_y), bitmap.width());
base::span<const SkPMColor> cur_src1 = cur_src0;
```

## Note
The rewriter also needs to modify the subspan function call. Rewriter needs to generate code to construct a span from the return value of a third_party function. The size is hard to identify.

```c++
cur_src0 = cur_src0.subspan(2);
cur_src1 = cur_src1.subspan(2);
```

should be

```c++
cur_src0 = base::span<const SkPMColor>(cur_src0.data() + 2, bitmap.width() - 2);
cur_src1 = base::span<const SkPMColor>(cur_src1.data() + 2, bitmap.width() - 2);