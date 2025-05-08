# Build Failure Analysis: 2025_05_02_patch_824

## First error
../../components/zucchini/io_utils.h:86:6: error: invalid operands to binary expression ('std::ostream' (aka 'basic_ostream<char>') and 'std::array<char, 8 + 1>')

## Category
Rewriter needs to add `.data()` to arrayified `char[]` variable used with `std::ostream`.

## Reason
The code attempts to stream a `std::array<char, N + 1>` object `buf` directly into an `std::ostream`. The `std::ostream` class does not have an overload for `std::array<char, N+1>`.  The original code likely used a `char[]` which decays to `char*`, for which `std::ostream` *does* have an overload. The rewriter converted the `char[]` to `std::array`, but did not account for this change in streaming behavior.

## Solution
The rewriter should add `.data()` to the variable `buf` when used with `std::ostream`, to decay the `std::array` to `char*`. This will provide the correct input type for the `<<` operator.

The code should be changed from:
```c++
os << buf;
```
to:
```c++
os << buf.data();
```

## Note
None