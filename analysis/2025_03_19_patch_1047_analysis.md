```
# Build Failure Analysis: 1047

## First error

../../ui/gfx/skbitmap_operations.cc:149:26: error: no viable conversion from 'uint32_t *' (aka 'unsigned int *') to 'base::span<uint32_t>' (aka 'span<unsigned int>')

## Category
Rewriter needs to generate code to construct a span from the return value of a third_party function.

## Reason
The rewriter is replacing `uint32_t* dst_row` with `base::span<uint32_t> dst_row` which is correct. However the line `uint32_t* dst_row = background.getAddr32(0, y);` assigns a `uint32_t*` to a `base::span<uint32_t>`. `background.getAddr32()` is a third party function. The rewriter should generate code to construct a span from the return value of the third party function.

## Solution
The rewriter needs to generate code to construct a span from the return value of third party functions. In this case, the solution is to construct a span by adding the `size` parameter:
```c++
base::span<uint32_t> dst_row = base::span(background.getAddr32(0, y), background.width());
```

## Note
Since `getAddr32()` returns a raw pointer, it may be unsafe if the lifetime of the underlying buffer is shorter than the span. However, in this case the buffer is owned by the `background` `SkBitmap` object, so the lifetime should be the same.