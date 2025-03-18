# Build Failure Analysis: 2025_03_16_patch_352

## First error

../../content/browser/media/capture/desktop_capture_device.cc:623:40: error: invalid operands to binary expression ('base::span<uint8_t>' (aka 'span<unsigned char>') and 'const int')
  623 |           UNSAFE_BUFFERS(temp_buffer_y + temp_plane_size_y);

## Category
Rewriter needs to generate code to construct a span from the return value of a third_party function.

## Reason
The code attempts to perform pointer arithmetic on a `base::span<uint8_t>` object, which is not allowed. The original code used raw pointers, which permitted this operation. The rewriter replaced the raw pointer with a span, but did not update the pointer arithmetic to be compatible with the span type. The error message indicates that the `+` operator is not defined for `base::span<uint8_t>` and `const int`.

## Solution
The rewriter needs to use `.subspan()` to create a new span that is a subset of the original span. Instead of using `temp_buffer_y + temp_plane_size_y` which attempts to do pointer arithmetic, it should create a new span with `.subspan(temp_plane_size_y)`. The code should be modified to look like this:

```
base::span<uint8_t> temp_buffer_y = temp_buffer_;
base::span<uint8_t> temp_buffer_u =
    UNSAFE_BUFFERS(temp_buffer_y.subspan(temp_plane_size_y));
uint8_t* temp_buffer_v =
    UNSAFE_BUFFERS(temp_buffer_u + temp_plane_size_uv);
```

## Note
There are similar errors on line 681, and it should be fixed similarly.
```