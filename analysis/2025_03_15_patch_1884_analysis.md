```
# Build Failure Analysis: 2025_03_15_patch_1884

## First error

../../components/feedback/redaction_tool/url_canon_ip.cc:451:32: error: no matching function for call to '_strtoui64'
  451 |   return static_cast<uint16_t>(_strtoui64(buf, nullptr, 16));
      |                                ^~~~~~~~~~
../../components/feedback/redaction_tool/url_canon_internal.h:97:17: note: candidate function not viable: no known conversion from 'std::array<char, 5>' to 'const char *' for 1st argument
   97 | inline uint64_t _strtoui64(const char* nptr, char** endptr, int base) {
      |                 ^          ~~~~~~~~~~~~~~~~

## Category
Rewriter needs to add .data() to arrayified variable used with third_party function.

## Reason
The rewriter replaced a `char buf[5]` with `std::array<char, 5> buf`. The `_strtoui64` function expects a `const char*` as its first argument. The rewriter failed to add `.data()` to the `buf` variable when passing it to `_strtoui64`, causing a type mismatch. The function `_strtoui64` is defined in `url_canon_internal.h` so it's third party code.

## Solution
The rewriter needs to add `.data()` to the `buf` variable when passing it to `_strtoui64`.

```c++
return static_cast<uint16_t>(_strtoui64(buf.data(), nullptr, 16));
```

## Note
The rewriter correctly converted the C-style array to a `std::array`. However, it failed to account for the different way to access the underlying character data when calling the `_strtoui64` function.