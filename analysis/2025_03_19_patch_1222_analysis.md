# Build Failure Analysis: 2025_03_19_patch_1222

## First error

../../url/url_canon_ip.h:448:32: error: no matching function for call to 'StringToUint64WithBase'
  448 |   return static_cast<uint16_t>(StringToUint64WithBase(buf, 16));
      |                                ^~~~~~~~~~~~~~~~~~~~~~
../../url/url_canon_internal.h:561:20: note: candidate function not viable: no known conversion from 'std::array<char, 5>' to 'std::string_view' (aka 'basic_string_view<char>') for 1st argument
  561 | constexpr uint64_t StringToUint64WithBase(std::string_view str, uint8_t base) {
      |                    ^                      ~~~~~~~~~~~~~~~~~~~~

## Category
Rewriter needs to add .data() when converting a C-style array to std::array in a third_party function call.

## Reason
The rewriter converted a `char[]` to `std::array<char, 5>` named `buf`. The `buf` variable was then passed to `StringToUint64WithBase`, which expects a `std::string_view`.  Since `std::array` doesn't implicitly convert to `std::string_view`, the code no longer compiles. The rewriter should have added `.data()` to pass a C-style pointer.

## Solution
The rewriter should append `.data()` when passing an `std::array` to a function that expects a `std::string_view`.
For example, the rewriter should change the line
```c++
return static_cast<uint16_t>(StringToUint64WithBase(buf, 16));
```
to
```c++
return static_cast<uint16_t>(StringToUint64WithBase(buf.data(), 16));
```

## Note
`StringToUint64WithBase` is a first party function, but lives in `url/` and `url` isn't part of `base/`.