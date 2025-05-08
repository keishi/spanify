# Build Failure Analysis: 2025_05_02_patch_972

## First error

../../net/websockets/websocket_channel_test.cc:2251:52: error: invalid operands to binary expression ('const array<remove_cv_t<char>, 12UL>' (aka 'const array<char, 12UL>') and 'const size_t' (aka 'const unsigned long'))
 2251 |                                        kBinaryBlob + kBinaryBlobSize)),
      |                                        ~~~~~~~~~~~ ^ ~~~~~~~~~~~~~~~

## Category
Rewriter needs to add .data() to arrayified `char[]` variable used with std::string.

## Reason
The original code was using pointer arithmetic `kBinaryBlob + kBinaryBlobSize` to point to the end of the array. After converting `kBinaryBlob` to `std::array`, this expression is no longer valid. The `std::string` constructor is expecting a `const char*` as input. Since the variable has been arrayified, the rewriter needs to add `.data()` to access the underlying `char*`.

## Solution
The rewriter should recognize this pattern where an arrayified `char[]` is used with `std::string` and add `.data()` to fix it.

## Note
There is a similar error on line 2284.