# Build Failure Analysis: 2025_03_14_patch_1439

## First error

../../base/debug/dwarf_line_no.cc:1159:44: error: invalid operands to binary expression ('char *' and 'base::span<char>')

## Category
Rewriter needs to properly handle pointer arithmetic when base::span is used.

## Reason
The rewriter replaced `char* out` with `base::span<char> out`. Then the following code became invalid.
```c++
out_pos = static_cast<size_t>(result.ptr - out);
```
Because `out` is now a `base::span` instead of a `char*`, we can no longer subtract `out` from `result.ptr`.

## Solution
Replace pointer arithmetic with `out.data()`
```c++
out_pos = static_cast<size_t>(result.ptr - out.data());
```

## Note
The same error occurred twice in the build log, so this pattern appears in multiple places.
```
../../base/debug/dwarf_line_no.cc:1159:44: error: invalid operands to binary expression ('char *' and 'base::span<char>')
../../base/debug/dwarf_line_no.cc:1169:44: error: invalid operands to binary expression ('char *' and 'base::span<char>')