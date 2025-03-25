# Build Failure Analysis: 2025_03_19_patch_1450

## First error

../../ui/events/event_dispatcher_unittest.cc:267:35: error: invalid operands to binary expression ('array<remove_cv_t<int>, 8UL>' (aka 'array<int, 8UL>') and 'unsigned long')
  267 |                          expected + (expected.size() *
      |                          ~~~~~~~~ ^ ~~~~~~~~~~~~~~~~~~

## Category
Rewriter failed to apply subspan rewrite to a spanified return value.

## Reason
`expected` is of type `std::array<int, 8UL>`. `expected.size()` returns an `unsigned long`. `(expected.size() * sizeof(decltype(expected)::value_type)) / sizeof(int)` is an `unsigned long`. You can't add an `unsigned long` to `expected` which is a `std::array`. The expression was trying to compute the end pointer of `expected` which used to work with a C-style array, but not with a C++ `std::array`.

## Solution
The rewriter failed to add `.data()` after the variable `expected`. The rewriter logic should be updated to add `.data()` to `expected` in this expression.

```
-                          expected + (expected.size() *
+                          expected.data() + (expected.size() *