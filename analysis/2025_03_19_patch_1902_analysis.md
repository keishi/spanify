# Build Failure Analysis: 2025_03_19_patch_1902

## First error

../../components/zucchini/io_utils.h:86:6: error: invalid operands to binary expression ('std::ostream' (aka 'basic_ostream<char>') and 'std::array<char, 8 + 1>')

## Category
Rewriter needs to add .data() to arrayified `char[]` variable used with std::string.

## Reason
The code attempts to stream a `std::array<char, N>` directly to `std::ostream`.  `std::ostream` does not have an overload for `std::array<char, N>`, but it does have one for `const char*`. The rewriter converted `char buf[N + 1]` to `std::array<char, N + 1> buf;`, but it is being used with ostream. The rewriter should recognize this pattern and add `.data()` to the `buf` variable.

## Solution
The rewriter should add `.data()` when streaming a `std::array<char, N>` to `std::ostream`.

For example, this line in the diff

```
-  os << buf;
+  os << buf.data();