# Build Failure Analysis: 2025_03_15_patch_1003

## First error

../../net/websockets/websocket_channel_test.cc:2251:52: error: invalid operands to binary expression ('const array<remove_cv_t<char>, 12UL>' (aka 'const array<char, 12UL>') and 'const size_t' (aka 'const unsigned long'))
 2251 |                                        kBinaryBlob + kBinaryBlobSize)),
      |                                        ~~~~~~~~~~~ ^ ~~~~~~~~~~~~~~~

## Category
Rewriter needs to add .data() to arrayified `char[]` variable used with std::string.

## Reason
The code is trying to construct a `std::string` using pointer arithmetic on `kBinaryBlob`, which is now a `std::array`. The `std::string` constructor expects a `char*` as the beginning and ending pointer of the C-style string. Adding a `size_t` (kBinaryBlobSize) to a `std::array` object doesn't produce a `char*`. The rewriter converted the original `char[]` to `std::array<char, 12UL>`, but forgot to add `.data()` to get the underlying pointer to the character data.

## Solution
The rewriter should add `.data()` to the arrayified `kBinaryBlob` when it is being used in pointer arithmetic, especially in cases where it's used to construct a `std::string`.

The line of code:
```c++
std::string(kBinaryBlob, kBinaryBlob + kBinaryBlobSize))
```
Should be converted to:
```c++
std::string(kBinaryBlob.data(), kBinaryBlob.data() + kBinaryBlobSize))
```

## Note
The error also appears on line 2284. Both lines must be fixed to solve the problem.