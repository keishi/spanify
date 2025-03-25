# Build Failure Analysis: 2025_03_19_patch_1829

## First error

../../components/gwp_asan/client/lightweight_detector/poison_metadata_recorder.cc:82:13: error: use of undeclared identifier 'deallocation_stack_trace'

## Category
Rewriter needs to use the correct member name after spanifying a member field.

## Reason
The code attempts to use `deallocation_stack_trace` as a variable, but after spanifying the `stack_trace_pool` member in `AllocatorState`, `deallocation_stack_trace` is no longer directly accessible. It needs to be accessed via `slot_metadata`.

## Solution
Rewriter needs to generate the correct member name after spanifying a member field of a class. The original code was:
```c++
sizeof(decltype(deallocation_stack_trace)::value_type)
```
The rewriter should now be:
```c++
sizeof(decltype(slot_metadata.deallocation_stack_trace)::value_type)
```

## Note
There are other similar errors. The rewriter should also fix the following:

*   Using `deallocation_stack_trace.size()` should become `slot_metadata.deallocation_stack_trace.size()`