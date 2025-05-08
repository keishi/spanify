# Build Failure Analysis: 2025_05_02_patch_1169

## First error

../../third_party/blink/renderer/core/svg/svg_path_byte_stream_builder.cc:48:31: error: invalid operands to binary expression ('std::array<unsigned char, sizeof(uint16_t) + sizeof(gfx::PointF) * 3>' and 'wtf_size_t' (aka 'unsigned int'))
   48 |     UNSAFE_TODO(memcpy(bytes_ + current_offset_, data.bytes, type_size));
      |                        ~~~~~~ ^ ~~~~~~~~~~~~~~~

## Category
Rewriter failed to properly decay `std::array` to a pointer for pointer arithmetic.

## Reason
The original code used `unsigned char bytes_[]`, which decays to a pointer when used in pointer arithmetic. After the rewriter converted the array to `std::array<unsigned char, ...>`, `bytes_` no longer decays to a pointer.  The expression `bytes_ + current_offset_` attempts to add an integer offset to an `std::array` object, which is not a valid operation. The rewriter should have added `.data()` to `bytes_` to obtain a raw pointer to the underlying array data before performing pointer arithmetic.

## Solution
The rewriter needs to add `.data()` to the `bytes_` variable to get a pointer to the underlying array, and then the pointer arithmetic will be valid.

```c++
// Before
UNSAFE_TODO(memcpy(bytes_ + current_offset_, data.bytes, type_size));

// After
UNSAFE_TODO(memcpy(bytes_.data() + current_offset_, data.bytes, type_size));
```

## Note
The error occurred in `memcpy`, which expects a pointer as its destination argument.