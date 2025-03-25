# Build Failure Analysis: 2025_03_19_patch_1039

## First error

../../ui/gfx/skbitmap_operations.cc:48:26: error: no viable conversion from 'uint32_t *' (aka 'unsigned int *') to 'base::span<uint32_t>' (aka 'span<unsigned int>')
48 |     base::span<uint32_t> dst_row = inverted.getAddr32(0, y);
   |                          ^         ~~~~~~~~~~~~~~~~~~~~~~~~

## Category
Rewriter failed to apply subspan rewrite to a spanified return value.

## Reason
The `inverted.getAddr32(0, y)` function returns `uint32_t*`. The rewriter is trying to assign this raw pointer to a `base::span<uint32_t>`. Since the return value of `getAddr32` is a raw pointer to the start of the row, the span should be created from it. The subspan rewrite should be applied to it so the size info can be preserved.

## Solution
Rewriter needs to construct a span from the return value of `inverted.getAddr32` by calling `.subspan()` to pass the size info. The rewrite should be:
```c++
base::span<uint32_t> dst_row = base::span(inverted.getAddr32(0, y), inverted.width());
```

## Note
The `SkBitmapOperations::CreateInvertedBitmap` is not third party code. Therefore the rewriter should have modified this code.
```
Name:        SkBitmapOperations::CreateInvertedBitmap
Linkage:     ExternalLinkage
FunctionDecl 0x1367b50 <../../ui/gfx/skbitmap_operations.cc:43:1, line:51:1> CreateInvertedBitmap 'SkBitmap (const SkBitmap &)'