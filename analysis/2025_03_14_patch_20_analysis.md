```
# Build Failure Analysis: 2025_03_14_patch_20

## First error

../../ui/gfx/skbitmap_operations.cc:48:26: error: no viable conversion from 'uint32_t *' (aka 'unsigned int *') to 'base::span<uint32_t>' (aka 'span<unsigned int>')
   48 |     base::span<uint32_t> dst_row = inverted.getAddr32(0, y);
      |                          ^         ~~~~~~~~~~~~~~~~~~~~~~~~

## Category
Rewriter needs to generate code to construct a span from the return value of a third_party function.

## Reason
The code attempts to assign the raw pointer returned by the third_party function `inverted.getAddr32` directly to a `base::span<uint32_t>`. However, `base::span` requires the size of the data to be specified during construction (or deduced from the array type), which is not happening here. The compiler error indicates that there's no implicit conversion from `uint32_t*` to `base::span<uint32_t>`.

## Solution
The rewriter needs to generate code that explicitly constructs a `base::span` from the raw pointer and a size. Since `getAddr32` returns a pointer to a row in the SkBitmap, the size of the span should be the width of the bitmap.
Replace
```c++
base::span<uint32_t> dst_row = inverted.getAddr32(0, y);
```
with
```c++
base::span<uint32_t> dst_row(inverted.getAddr32(0, y), inverted.width());
```

## Note
The function `SkBitmap::getAddr32` is third party code so it should not be spanified.