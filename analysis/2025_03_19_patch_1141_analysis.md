# Build Failure Analysis: 2025_03_19_patch_1141

## First error

../../url/url_canon_ip.h:125:18: error: no matching function for call to 'StringToUint64WithBase'
  125 |   uint64_t num = StringToUint64WithBase(buf, BaseForType(base));
      |                  ^~~~~~~~~~~~~~~~~~~~~~
../../url/url_canon_internal.h:561:20: note: candidate function not viable: no known conversion from 'std::array<char, kMaxComponentLen + 1>' to 'std::string_view' (aka 'basic_string_view<char>') for 1st argument
  561 | constexpr uint64_t StringToUint64WithBase(std::string_view str, uint8_t base) {
      |                    ^                      ~~~~~~~~~~~~~~~~~~~~

## Category
Rewriter needs to add .data() to arrayified `char[]` variable used with `std::string_view`.

## Reason
The rewriter replaced `char buf[]` with `std::array<char, N> buf`. However, `StringToUint64WithBase` takes a `std::string_view` as an argument. `std::array` doesn't implicitly convert to `std::string_view`. The rewriter needs to insert `.data()` to convert the `std::array` to a `char*` which can then be implicitly converted to `std::string_view`.

## Solution
The rewriter should add `.data()` to arrayified `char[]` variables being passed to functions that expect a `std::string_view`.

```c++
-  uint64_t num = StringToUint64WithBase(buf, BaseForType(base));
+  uint64_t num = StringToUint64WithBase(buf.data(), BaseForType(base));