# Build Failure Analysis: 2025_03_19_patch_1380

## First error

../../gpu/command_buffer/service/shared_image/gl_repack_utils.cc:89:23: error: no viable conversion from 'uint8_t *' (aka 'unsigned char *') to 'base::span<uint8_t>' (aka 'span<unsigned char>')

## Category
Rewriter needs to generate code to construct a span from a raw pointer.

## Reason
The rewriter is attempting to assign a raw pointer to a `base::span<uint8_t>`. However, `base::span` does not have an implicit constructor from a raw pointer. It needs to be explicitly constructed with a size.

## Solution
The rewriter needs to use `base::span(data, size)` to construct the span. It can determine the size from `pixmap.rowBytes() * pixmap.height()`.

For example, replace:

```c++
base::span<uint8_t> data = static_cast<uint8_t*>(pixmap.writable_addr());
```

with:

```c++
base::span<uint8_t> data(static_cast<uint8_t*>(pixmap.writable_addr()), pixmap.rowBytes() * pixmap.height());