# Build Failure Analysis: 2025_05_02_patch_1630

## First error

../../components/webrtc_logging/common/partial_circular_buffer_unittest.cc:155:43: error: invalid operands to binary expression ('std::array<uint8_t, sizeof (kOutputRefDataWrap)>' (aka 'array<unsigned char, sizeof (kOutputRefDataWrap)>') and 'uint32_t' (aka 'unsigned int'))
  155 |               pcb_read_->Read(output_data + read, size_per_read));
      |                               ~~~~~~~~~~~ ^ ~~~~

## Category
Rewriter needs to add .data() to arrayified variable used with `uint8_t*`.

## Reason
The rewriter converted `output_data` from `uint8_t[]` to `std::array<uint8_t, ...>`. The code then attempts to use pointer arithmetic on `output_data` by adding an offset `read`. However, `std::array` does not support pointer arithmetic directly. The rewriter needs to add `.data()` to `output_data` to get a raw pointer to the underlying data, which can then be used with pointer arithmetic.

## Solution
The rewriter should add `.data()` to the `output_data` variable when it is used in pointer arithmetic. The corrected code should be:
```c++
pcb_read_->Read(output_data.data() + read, size_per_read));
```

## Note
The other errors are cascading errors from the first error.