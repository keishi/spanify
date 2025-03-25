# Build Failure Analysis: 2025_03_19_patch_1449

## First error

../../ui/events/event_dispatcher_unittest.cc:285:35: error: invalid operands to binary expression ('array<remove_cv_t<int>, 4UL>' (aka 'array<int, 4UL>') and 'unsigned long')
  285 |                          expected + (expected.size() *

## Category
Rewriter failed to apply subspan rewrite to a spanified return value.

## Reason
The rewriter converted `expected` to `std::array<int, 4UL>`. The expression `expected + (expected.size() * sizeof(decltype(expected)::value_type)) / sizeof(int)` is attempting to perform pointer arithmetic on `expected` after it has been arrayified, which is invalid.

This pattern matches the case where `data()` was spanified, and the rewriter failed to add `.data()` to the spanified return value. After arrayification, it also needs to call `.data()` to get a pointer to the underlying data. Then it should apply pointer arithmetic and call `.data()` again at the end. In this case, the arithmetic is trying to calculate a raw pointer to the element just after the last element in the array (to be used as the exclusive end for a range).

## Solution
The rewriter needs to correctly apply pointer arithmetic after arrayification by adding `.data()` to get the raw pointer before arithmetic, and calling `.data()` at the end to get the pointer value.

## Note
```
The original code:
std::vector<int>(expected, expected + sizeof(expected) / sizeof(int))
The spanified code:
std::vector<int>(expected.data(),
                         expected + (expected.size() *
                                     sizeof(decltype(expected)::value_type)) /
                                        sizeof(int))