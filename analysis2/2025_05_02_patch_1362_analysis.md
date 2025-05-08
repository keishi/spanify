# Build Failure Analysis: 2025_05_02_patch_1362

## First error

../../net/websockets/websocket_frame_parser_test.cc:93:40: error: invalid operands to binary expression ('const std::array<char, 14>' and 'const uint64_t' (aka 'const unsigned long'))

## Category
Rewriter needs to add .data() to arrayified `char[]` variable used with std::equal.

## Reason
The code attempts to add a number to a `std::array`, which is not allowed. This happened because the rewriter converted a `char[]` to `std::array<char, N>`, but the original code was using pointer arithmetic with `kHello + kHelloLength`. `std::equal` takes two iterators as parameters, and iterators can be obtained from array using `kHello.data()` and `kHello.data() + kHelloLength`. Rewriter should recognize this pattern and add .data().

## Solution
The rewriter should recognize this pattern and add `.data()` when a converted `std::array` variable is used with pointer arithmetic, particularly with `std::equal`. The fix involves changing `kHello + kHelloLength` to `kHello.data() + kHelloLength`.

## Note
The rewriter also failed to recognize that `subspan` is not a member of `std::array`, so it is also related to converting C-style arrays to `std::array`.