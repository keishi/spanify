# Build Failure Analysis: 2025_03_19_patch_1049

## First error

../../ui/gfx/skbitmap_operations.cc:151:26: error: no viable conversion from 'uint32_t *' (aka 'unsigned int *') to 'base::span<uint32_t>' (aka 'span<unsigned int>')

## Category
Rewriter failing to recognize raw pointer passed to spanified function.

## Reason
The code attempts to assign a raw pointer (`uint32_t*`) to a `base::span<uint32_t>`. The span constructor needs to be explicitly called in such cases. The rewriter doesn't seem to detect the case where a `uint32_t*` is assigned to a `base::span<uint32_t>`. This could be because the rewriter failed to recognize that `mask.getAddr32(0, y)` actually returns a raw pointer to the beginning of a row.

## Solution
The rewriter should insert the necessary span constructor invocation, wrapping the pointer with the correct size. In this case, the rewriter must determine the row size from `mask.width()`. Thus the code should be rewritten as:

```c++
base::span<uint32_t> mask_row = base::span<uint32_t>(mask.getAddr32(0, y), mask.width());
```

## Note
It might be worth checking if SkBitmap provides a method to directly get a span of a row. Otherwise, `mask.width()` needs to be evaluated at every row.