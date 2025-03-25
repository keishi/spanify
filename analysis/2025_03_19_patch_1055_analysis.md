# Build Failure Analysis: 2025_03_19_patch_1055

## First error

../../ui/gfx/skbitmap_operations.cc:602:27: error: no viable conversion from 'uint32_t *' (aka 'unsigned int *') to 'base::span<SkPMColor>' (aka 'span<unsigned int>')

## Category
Rewriter needs to generate code to construct a span from the return value of a third_party function.

## Reason
The code attempts to assign the raw pointer returned by `bitmap.getAddr32` to `base::span<SkPMColor> cur_dst`. The rewriter should have generated code to construct the span from the raw pointer and its size. The error indicates there's no implicit conversion available from raw pointer to the span.  Also, `SkBitmap::getAddr32()` is third party code.

## Solution
Since the return value is from third_party code, we need to create a span from the return value. To do this, we need to determine the size of the data that the raw pointer is pointing to.

The rewriter should have added code like this:

```c++
base::span<SkPMColor> cur_dst(bitmap.getAddr32(0, dest_y), result.width());
```

Then change `cur_dst++` to `cur_dst[dest_x]`.

## Note
The second error occurs because the `cur_dst` variable is a span and cannot be incremented like a pointer. This is a consequence of the first error not being handled correctly.