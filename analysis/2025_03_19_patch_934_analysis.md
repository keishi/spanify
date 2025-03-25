# Build Failure Analysis: 2025_03_19_patch_934

## First error

../../components/webrtc_logging/common/partial_circular_buffer_unittest.cc:155:43: error: invalid operands to binary expression ('std::array<uint8_t, sizeof (kOutputRefDataWrap)>' (aka 'array<unsigned char, sizeof (kOutputRefDataWrap)>') and 'uint32_t' (aka 'unsigned int'))
  155 |               pcb_read_->Read(output_data + read, size_per_read));
      |                               ~~~~~~~~~~~ ^ ~~~~

## Category
Rewriter needs to add .data() to arrayified `char[]` variable used with std::string.

## Reason
The original code used pointer arithmetic on `output_data`, which was a C-style array. After the rewriter converted `output_data` to `std::array`, the pointer arithmetic `output_data + read` became invalid. The correct way to perform pointer arithmetic on a `std::array` is to use `output_data.data() + read`.

## Solution
The rewriter needs to add `.data()` to `output_data` when it is used in pointer arithmetic. The code should be changed to:

```c++
pcb_read_->Read(output_data.data() + read, size_per_read));
```

## Note
The other errors are related to the same issue. Also the rewriter changed sizeof(output_data) to output_data.size() * sizeof(decltype(output_data)::value_type)), but missed adding .data() in the call to memcmp and pcb_read_->Read on line 165.