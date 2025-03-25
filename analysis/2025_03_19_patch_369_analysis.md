# Build Failure Analysis: 2025_03_19_patch_369

## First error

../../net/websockets/websocket_frame_parser_test.cc:93:40: error: invalid operands to binary expression ('const std::array<char, 14>' and 'const uint64_t' (aka 'const unsigned long'))

## Category
Rewriter needs to add .data() to arrayified `char[]` variable used with std::string.

## Reason
The rewriter converted `kHello` from `char[]` to `std::array<char, 14>`. The code then tries to perform pointer arithmetic on `kHello`.

```c++
   93 |       std::equal(kHello.data(), kHello + kHelloLength, frame->payload.data()));
```

This results in a compilation error because you cannot perform pointer arithmetic directly on a `std::array` object. Adding `.data()` to kHello resolves the immediate error.

## Solution
The rewriter should recognize this pattern and add `.data()` to `kHello`.

## Note
There are also errors for usage of `.subspan()` on `std::array`, which should be handled with the same fix.
```c++
   93 |       std::equal(kHello.data(), kHello.data() + kHelloLength, frame->payload.data()));
  223 |                                 kHello.subspan(cutting_pos).data());
  224 |     std::vector<char> expected2(kHello.subspan(cutting_pos).data(),
  225 |                                 kHello.subspan(kHelloLength).data());
  294 |                                 kHello.subspan(cutting_pos).data());
  295 |     std::vector<char> expected2(kHello.subspan(cutting_pos).data(),
  296 |                                 kHello.subspan(kHelloLength).data());
```
The rewriter needs to use `base::span` instead of `std::array`'s `subspan`. It should add `.data()` after spanified value to retrieve the underlying pointer value.
```c++
   93 |       std::equal(kHello.data(), base::span(kHello).data() + kHelloLength, frame->payload.data()));
  223 |                                 base::span(kHello).subspan(cutting_pos).data());
  224 |     std::vector<char> expected2(base::span(kHello).subspan(cutting_pos).data(),
  225 |                                 base::span(kHello).subspan(kHelloLength).data());
  294 |                                 base::span(kHello).subspan(cutting_pos).data());
  295 |     std::vector<char> expected2(base::span(kHello).subspan(cutting_pos).data(),
  296 |                                 base::span(kHello).subspan(kHelloLength).data());