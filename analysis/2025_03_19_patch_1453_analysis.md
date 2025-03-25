```
# Build Failure Analysis: 2025_03_19_patch_1453

## First error

../../ui/events/event_dispatcher_unittest.cc:345:26: error: invalid operands to binary expression ('array<remove_cv_t<int>, 2UL>' (aka 'array<int, 2UL>') and 'unsigned long')

## Category
Rewriter added .data() to a variable/member it did not spanify/arrayify.

## Reason
The `handlers` variable was arrayified, but the expression `handlers + (handlers.size() * sizeof(decltype(handlers)::value_type)) / sizeof(int)` is attempting pointer arithmetic with the raw array. `handlers` should be converted to `handlers.data()` before such arithmetic. This indicates a bug where .data() is only applied in the function call, but not when pointer arithmetic was applied to the arrayified variable.

## Solution
The rewriter needs to add `.data()` to arrayified variable in cases where the array variable is used in pointer arithmetic. In this case we need to update the rewriter such that we can replace.

```
handlers + (handlers.size() * sizeof(decltype(handlers)::value_type)) / sizeof(int)
```

with

```
handlers.data() + (handlers.size() * sizeof(decltype(handlers)::value_type)) / sizeof(int)
```

## Note
There was only one error in this build failure.