# Build Failure Analysis: 2025_03_19_patch_1053

## First error

../../ui/gfx/skbitmap_operations.cc:550:26: error: no viable conversion from 'uint32_t *' (aka 'unsigned int *') to 'base::span<uint32_t>' (aka 'span<unsigned int>')
  550 |     base::span<uint32_t> dst_row = cropped.getAddr32(0, y);
      |                          ^         ~~~~~~~~~~~~~~~~~~~~~~~

## Category
Rewriter needs to generate code to construct a span from the return value of a third_party function.

## Reason
The return value of `cropped.getAddr32(0, y)` is a raw pointer (`uint32_t*`). The rewriter needs to generate code to construct a span from this raw pointer, however it did not generate the correct code to do so. It is also difficult to identify the size of the raw pointer in this case.

## Solution
The rewriter needs to wrap the return value of cropped.getAddr32() with base::make_span or base::span.

```c++
-   uint32_t* dst_row = cropped.getAddr32(0, y);
+   base::span<uint32_t> dst_row = base::make_span(cropped.getAddr32(0, y), cropped.width());