# Build Failure Analysis: 2025_03_19_patch_225

## First error

../../net/dns/dns_response_unittest.cc:71:41: error: invalid operands to binary expression ('const array<remove_cv_t<unsigned char>, 25UL>' (aka 'const array<unsigned char, 25UL>') and 'int')

## Category
Rewriter needs to add .data() to arrayified `char[]` variable used with `std::string`.

## Reason
The rewriter converted a `uint8_t data[]` to `std::array`, but it is now being used with pointer arithmetic `data + 0x00`. This is invalid as `data` is now a `std::array`. The rewriter should recognize this pattern and add `.data()` to the variable to avoid the error.

## Solution
The rewriter should add `.data()` when an arrayified `char[]` variable is used with pointer arithmetic. So, replace `data + 0x00` with `data.data() + 0x00`.

## Note
There are more errors of the same type later in the build log.