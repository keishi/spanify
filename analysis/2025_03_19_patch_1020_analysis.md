```
# Build Failure Analysis: 2025_03_19_patch_1020

## First error

../../third_party/blink/renderer/core/svg/svg_path_byte_stream_builder.cc:48:31: error: invalid operands to binary expression ('std::array<unsigned char, sizeof(uint16_t) + sizeof(gfx::PointF) * 3>' and 'wtf_size_t' (aka 'unsigned int'))
   48 |     UNSAFE_TODO(memcpy(bytes_ + current_offset_, data.bytes, type_size));
      |                        ~~~~~~ ^ ~~~~~~~~~~~~~~~

## Category
Rewriter needs to avoid using pointer arithmetic with array variables.

## Reason
The rewriter has converted `bytes_` from a C-style array to `std::array`.  However, the code still uses pointer arithmetic (`bytes_ + current_offset_`) as if it were a raw pointer. `std::array` does not support pointer arithmetic directly; instead, it needs to be accessed using array indexing.

## Solution
The rewriter should use array indexing instead of pointer arithmetic with `std::array`. In this case the fix is `bytes_[current_offset_]`.

## Note
The error message `invalid operands to binary expression ('std::array<unsigned char, sizeof(uint16_t) + sizeof(gfx::PointF) * 3>' and 'wtf_size_t' (aka 'unsigned int'))` clearly indicates that pointer arithmetic is being used with a `std::array`, which is not allowed.