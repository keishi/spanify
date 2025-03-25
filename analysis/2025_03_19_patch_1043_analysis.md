# Build Failure Analysis: 2025_03_19_patch_1043

## First error

../../ui/gfx/skbitmap_operations.cc:86:26: error: no viable conversion from 'uint32_t *' (aka 'unsigned int *') to 'base::span<uint32_t>' (aka 'span<unsigned int>')
   86 |     base::span<uint32_t> dst_row = blended.getAddr32(0, y);

## Category
Rewriter needs to generate code to construct a span from the return value of a third_party function.

## Reason
`SkBitmap::getAddr32` is a third-party function, and it returns a raw pointer `uint32_t*`. The rewriter needs to generate code to construct a span from the return value, but failed to identify the size so it generated incorrect code that caused a compiler error.

## Solution
The rewriter needs to generate code to construct a span from the return value of a third_party function, and identify the correct size. In this case, we have `blended`, and we are calling `getAddr32` for a specific row `y`. We should construct the span from data and width:

```c++
base::span<uint32_t> dst_row(blended.getAddr32(0, y), blended.width());
```

## Note
None