```
# Build Failure Analysis: 2025_03_16_patch_805

## First error

../../ui/gfx/skbitmap_operations.cc:86:26: error: no viable conversion from 'uint32_t *' (aka 'unsigned int *') to 'base::span<uint32_t>' (aka 'span<unsigned int>')

## Category
Rewriter needs to generate code to construct a span from a raw pointer.

## Reason
The rewriter spanified `dst_row` but it failed to generate a span constructor to convert the raw pointer returned by `blended.getAddr32(0, y)` to a `base::span<uint32_t>`.

## Solution
The rewriter needs to construct a span from the raw pointer with `data` and `size`. The correct code should be:

```c++
    base::span<uint32_t> dst_row(blended.getAddr32(0, y), blended.width());
```

## Note
This pattern has been seen before.