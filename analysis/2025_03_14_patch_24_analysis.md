# Build Failure Analysis: 2025_03_14_patch_24

## First error

../../ui/gfx/skbitmap_operations.cc:120:26: error: no viable conversion from 'uint32_t *' (aka 'unsigned int *') to 'base::span<uint32_t>' (aka 'span<unsigned int>')
  120 |     base::span<uint32_t> rgb_row = rgb.getAddr32(0, y);
      |                          ^         ~~~~~~~~~~~~~~~~~~~

## Category
Rewriter needs to generate code to construct a span from the return value of a third_party function.

## Reason
The error occurs because the return value of `rgb.getAddr32(0, y)` is `uint32_t*`, but the code tries to assign it directly to a `base::span<uint32_t>`. There is no implicit conversion from a raw pointer to a `base::span`. The rewriter needs to generate code that explicitly constructs a `base::span` from the pointer. `SkBitmap::getAddr32` is third_party code.

## Solution
The rewriter needs to generate a `base::span` from the raw pointer return value, so it needs to add an explicit span constructor, so replace this:

```c++
base::span<uint32_t> rgb_row = rgb.getAddr32(0, y);
```

with:

```c++
base::span<uint32_t> rgb_row(rgb.getAddr32(0, y), rgb.width());
```

## Note
Need to construct a span from a raw pointer return value from a third_party function, and pass in the size.