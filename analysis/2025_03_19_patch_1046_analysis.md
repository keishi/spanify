# Build Failure Analysis: 2025_03_19_patch_1046

## First error

../../ui/gfx/skbitmap_operations.cc:122:26: error: no viable conversion from 'uint32_t *' (aka 'unsigned int *') to 'base::span<uint32_t>' (aka 'span<unsigned int>')

## Category
Rewriter needs to generate code to construct a span from the return value of a third_party function.

## Reason
The code calls `masked.getAddr32(0, y)` which returns a raw `uint32_t*`. However, the rewriter spanified the type of `dst_row` to `base::span<uint32_t>`. The rewriter needs to generate code to construct a `base::span` from the raw pointer.

## Solution
The rewriter should insert code to construct a `base::span` using the returned pointer and its length. In this case, the length is the width of the bitmap.

The rewriter should replace this line:
```c++
uint32_t* dst_row = masked.getAddr32(0, y);
```
with:
```c++
base::span<uint32_t> dst_row = base::span<uint32_t>(masked.getAddr32(0, y), masked.width());
```

## Note
`SkBitmap::getAddr32` is third_party code.