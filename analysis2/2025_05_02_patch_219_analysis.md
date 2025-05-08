# Build Failure Analysis: 2025_05_02_patch_219

## First error

```
../../ui/events/event_dispatcher_unittest.cc:316:15: error: invalid operands to binary expression ('array<remove_cv_t<int>, 1UL>' (aka 'array<int, 1UL>') and 'unsigned long')
  316 |           exp + (exp.size() * sizeof(decltype(exp)::value_type)) / sizeof(int)),
      |           ~~~ ^ ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
```

## Category
Rewriter needs to avoid using + operator on std::array object.

## Reason
The rewriter changed `exp` from a C-style array to `std::array`. The original code used pointer arithmetic with the `+` operator to calculate the end of the array, which works for raw pointers but not directly on `std::array` objects.

## Solution
The code uses `exp + (exp.size() * sizeof(decltype(exp)::value_type)) / sizeof(int)` to represent the end of the array. This arithmetic doesn't work directly on `std::array`. The rewriter should recognize this pattern and replace this calculation with `exp.data() + exp.size()`.

## Note