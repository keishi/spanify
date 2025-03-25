# Build Failure Analysis: 2025_03_19_patch_1045

## First error

../../ui/gfx/skbitmap_operations.cc:121:26: error: no viable conversion from 'uint32_t *' (aka 'unsigned int *') to 'base::span<uint32_t>' (aka 'span<unsigned int>')
  121 |     base::span<uint32_t> alpha_row = alpha.getAddr32(0, y);

## Category
Rewriter needs to generate code to construct a span from the return value of a third_party function.

## Reason
The function `alpha.getAddr32(0, y)` is a third-party function. The rewriter needs to generate code to construct a span from the return value, but the size is hard to identify, causing an error.

## Solution
Rewriter needs to generate code to construct a span from the return value of a third_party function, but the size is hard to identify. Need to create `base::span` like this, where `width()` is the width of alpha bitmap:

```c++
base::span<uint32_t> alpha_row = base::span(alpha.getAddr32(0, y), alpha.width());