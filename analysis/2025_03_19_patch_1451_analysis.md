# Build Failure Analysis: 1526

## First error

../../ui/events/event_dispatcher_unittest.cc:301:34: error: invalid operands to binary expression ('array<remove_cv_t<int>, 5UL>' (aka 'array<int, 5UL>') and 'unsigned long')

## Category
Rewriter failing to apply subspan rewrite to a spanified return value.

## Reason
The original code `nexpected + (nexpected.size() * sizeof(decltype(nexpected)::value_type)) /  sizeof(int)` was calculating the end pointer of the array. However, the rewriter arrayified `nexpected` but didn't update the pointer arithmetic. It is trying to add an array and a size (unsigned long) which is invalid. This expression also appears in the std::vector constructor so that means the rewrite isn't happening there as well.

## Solution
The rewriter needs to rewrite the expression involving pointer arithmetic with the spanified return value to instead call .data() so the math operation applies to an `int*`.

## Note
The rewriter should have applied a `.data()` call when rewriting the expression:
`nexpected + (nexpected.size() * sizeof(decltype(nexpected)::value_type)) /  sizeof(int)` to be `nexpected.data() + (nexpected.size() * sizeof(decltype(nexpected)::value_type)) /  sizeof(int)`
so that the math expression would result in an `int*`.