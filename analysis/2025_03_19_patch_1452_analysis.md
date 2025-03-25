# Build Failure Analysis: 2025_03_19_patch_1452

## First error

../../ui/events/event_dispatcher_unittest.cc:316:15: error: invalid operands to binary expression ('array<remove_cv_t<int>, 1UL>' (aka 'array<int, 1UL>') and 'unsigned long')

## Category
Rewriter needs to avoid spanifying functions if it requires spanifying excluded code.

## Reason
The expression `exp + (exp.size() * sizeof(decltype(exp)::value_type)) / sizeof(int))` is attempting pointer arithmetic on an `std::array` object `exp`, which is incorrect. The rewriter introduced the `std::array` type but failed to update the pointer arithmetic to the appropriate `exp.data() + exp.size()`.  The rewriter spanified `std::vector<int>(exp, exp + sizeof(exp) / sizeof(int))` but generated code outside of the `std::vector` constructor that failed to compile.  The call to `exp.size()` is triggering the error.  The rewriter is attempting to spanify `ProcessEvent()`, but code in the unit test cannot be rewritten.

## Solution
The rewriter needs to avoid spanifying functions if it requires spanifying excluded code.  The `std::vector` constructor is attempting to take `exp + (exp.size() * sizeof(decltype(exp)::value_type)) / sizeof(int))` as an argument, and the rewriter failed to add .data() here.  The rewriter should recognize this pattern and not spanify this function if this results in code that is outside the rewriter's scope.

## Note
NA