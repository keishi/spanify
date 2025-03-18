# Build Failure Analysis: 2025_03_14_patch_1148

## First error

../../components/zucchini/io_utils.h:86:6: error: invalid operands to binary expression ('std::ostream' (aka 'basic_ostream<char>') and 'std::array<char, 8 + 1>')
   86 |   os << buf;
      |   ~~ ^  ~~~

## Category
Rewriter needs to add .data() to arrayified `char[]` variable used with std::string.

## Reason
The rewriter replaced a `char[]` with `std::array<char, N>`, but the code attempts to stream the `std::array` directly into an `std::ostream`. The `std::ostream` doesn't have an overload that directly accepts `std::array`, it expects a `char*` (C-style string).

## Solution
The rewriter should add `.data()` to the arrayified `char[]` variable when that variable is passed to an `std::ostream`, which will make the `std::array` compatible with the `std::ostream`.

```c++
os << buf.data();
```

## Note
The rewriter produced many additional errors after the first one, all related to streaming the `std::array` variable directly into an `std::ostream`.