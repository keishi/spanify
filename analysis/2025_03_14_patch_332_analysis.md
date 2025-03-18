# Build Failure Analysis: 2025_03_14_patch_332

## First error

../../ui/events/event_dispatcher_unittest.cc:345:26: error: invalid operands to binary expression ('array<remove_cv_t<int>, 2UL>' (aka 'array<int, 2UL>') and 'unsigned long')
  345 |                 handlers +
      |                 ~~~~~~~~ ^
  346 |                     (handlers.size() * sizeof(decltype(handlers)::value_type)) /
      |                     ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  347 |                         sizeof(int)),
      |                         ~~~~~~~~~~~

## Category
Rewriter needs to add .data() to arrayified variable used as a pointer.

## Reason
The original code used pointer arithmetic on the `handlers` array, which implicitly decays to a pointer. After converting `handlers` to `std::array`, it no longer decays to a pointer, so the pointer arithmetic `handlers + ...` is invalid.

The rewriter should have added `.data()` to get a pointer to the underlying array data, i.e., `handlers.data() + ...`.

## Solution
The rewriter needs to detect when an arrayified variable is being used in pointer arithmetic and add `.data()` to the expression. The AST matcher should look for `binaryOperator` with `+` where the left-hand side is a `DeclRefExpr` to an arrayified variable. In this case, it should add `.data()` after the variable name.

## Note
The code in question is:
```c++
EXPECT_EQ(std::vector<int>(
                handlers.data(),
                handlers +
                    (handlers.size() * sizeof(decltype(handlers)::value_type)) /
                        sizeof(int)),
            target.handler_list());
```
The rewriter should change it to:
```c++
EXPECT_EQ(std::vector<int>(
                handlers.data(),
                handlers.data() +
                    (handlers.size() * sizeof(decltype(handlers)::value_type)) /
                        sizeof(int)),
            target.handler_list());