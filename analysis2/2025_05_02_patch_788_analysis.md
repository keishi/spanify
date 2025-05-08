# Build Failure Analysis: 2025_05_02_patch_788

## First error

../../skia/ext/event_tracer_impl.cc:64:37: error: no matching constructor for initialization of 'base::trace_event::TraceArguments'
   64 |   base::trace_event::TraceArguments args(
      |                                     ^
   65 |       numArgs, argNames, argTypes,
      |       ~~~~~~~~~~~~~~~~~~~~~~~~~~~~
   66 |       reinterpret_cast<const unsigned long long*>(argValues));
      |       ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
../../base/trace_event/trace_arguments.h:610:3: note: candidate constructor not viable: no known conversion from 'const char **' to 'base::span<const char *const>' for 2nd argument
  610 |   TraceArguments(int num_args,
      |   ^
  611 |                  base::span<const char* const> arg_names,
      |                  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

## Category
Pointer passed into spanified function parameter.

## Reason
The constructor of `TraceArguments` was spanified to accept a `base::span<const char* const>` for the `arg_names` parameter. However, the call site in `event_tracer_impl.cc` is passing a `const char** argNames`, which is a raw pointer. The compiler cannot implicitly convert a raw pointer to a `base::span`. The rewriter should have identified this call site and spanified the `argNames` variable being passed, or wrapped it with a `base::span`.

## Solution
The rewriter needs to identify the call sites of spanified functions and ensure that the arguments being passed are compatible with the new spanified parameter types. In this case, either rewrite the code that produces `argNames` to use a `std::vector<const char*>` which can be implicitly converted to a `base::span`, or explicitly create a `base::span` from `argNames` at the call site using something like:

```c++
base::trace_event::TraceArguments args(
    numArgs, base::span<const char* const>(argNames, numArgs), argTypes,
    reinterpret_cast<const unsigned long long*>(argValues));
```
Or just spanify `argNames`.
```c++
base::span<const char* const> argNames
```

## Note
None