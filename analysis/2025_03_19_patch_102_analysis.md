# Build Failure Analysis: 2025_03_19_patch_102

## First error

../../device/fido/cable/v2_handshake_unittest.cc:433:64: error: invalid operands to binary expression ('std::array<uint8_t, 24>' (aka 'array<unsigned char, 24>') and 'size_t' (aka 'unsigned long'))

## Category
Rewriter needs to add .data() when using + operator with arrayified `char[]` variable.

## Reason
The code is trying to add a `size_t` to a `std::array<uint8_t, 24>`. This is not a valid operation.  The rewriter converted `test_data` to `std::array`, but failed to add `.data()` to the `test_data` when it is used with the addition operator.

## Solution
The rewriter should add `.data()` to `test_data` when it is used with the addition operator.

```c++
// Old:
std::vector<uint8_t>(test_data.data(), test_data + i));

// New:
std::vector<uint8_t>(test_data.data(), test_data.data() + i));