# Build Failure Analysis: 2025_03_14_patch_228

## First error

../../components/webrtc_logging/common/partial_circular_buffer_unittest.cc:155:43: error: invalid operands to binary expression ('std::array<uint8_t, sizeof (kOutputRefDataWrap)>' (aka 'array<unsigned char, sizeof (kOutputRefDataWrap)>') and 'uint32_t' (aka 'unsigned int'))

## Category
Rewriter needs to add .data() when converting a C-style array to std::array in a third_party function call.

## Reason
The rewriter converted a C-style array `output_data` to `std::array`, and it is being passed to the `pcb_read_->Read` function, which is technically third_party code. The rewriter should have added `.data()` to the variable so that `Read` can accept the argument.

## Solution
Add `.data()` to the variable passed into `Read`.

## Note
The second error is that the rewriter is passing `output_data` as the argument to `pcb_read_->Read`. Since this is third party code, the rewriter should not have changed this signature.