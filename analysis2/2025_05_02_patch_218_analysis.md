# Build Failure Analysis: 2025_05_02_patch_218

## First error

```
../../ui/events/event_dispatcher_unittest.cc:301:34: error: invalid operands to binary expression ('array<remove_cv_t<int>, 5UL>' (aka 'array<int, 5UL>') and 'unsigned long')
  301 |                        nexpected + (nexpected.size() *
      |                        ~~~~~~~~~ ^ ~~~~~~~~~~~~~~~~~~~
```

## Category

Rewriter failed to apply subspan rewrite to a spanified return value.

## Reason

The code is attempting to perform pointer arithmetic on a `std::array`, which is not allowed. The rewriter has converted `nexpected` to a `std::array`, but failed to rewrite the expression `nexpected + (nexpected.size() * sizeof(decltype(nexpected)::value_type)) / sizeof(int)`. The generated expression attempts to add the array `nexpected` with an offset of type `unsigned long`.

## Solution

The rewriter needs to add `.data()` to the `nexpected` array so that the pointer arithmetic is performed on the underlying C-style array within the `std::array`. The correct code should be:
```c++
      std::vector<int>(nexpected.data(),
                       nexpected.data() + (nexpected.size() *
                                    sizeof(decltype(nexpected)::value_type)) /
                                       sizeof(int)),
```

## Note

The error message indicates that the `+` operator is not defined for `std::array` and `unsigned long`.