# Build Failure Analysis: 2025_05_02_patch_838

## First error

../../device/fido/cable/v2_handshake_unittest.cc:433:64: error: invalid operands to binary expression ('std::array<uint8_t, 24>' (aka 'array<unsigned char, 24>') and 'size_t' (aka 'unsigned long'))
  433 |               std::vector<uint8_t>(test_data.data(), test_data + i));
      |                                                      ~~~~~~~~~ ^ ~

## Category
Rewriter needs to add .data() to arrayified `char[]` variable used with std::string.

## Reason
The code is trying to create a `std::vector` using iterators. The first iterator is obtained using `.data()`. The second iterator is obtained by adding an integer offset `i` to `test_data`, but `test_data` is now a `std::array` not a raw pointer. You can't add an integer directly to a `std::array`. The rewriter should have added `.data()` in this case as well.

## Solution
The rewriter should have converted `test_data + i` to `test_data.data() + i`. This requires recognizing that `test_data` was converted to `std::array`, and that it is being used to calculate an address by adding `i`.

## Note
N/A