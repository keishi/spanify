# Build Failure Analysis: 2025_05_02_patch_759

## First error

../../v8/include/cppgc/allocation.h:240:32: error: no matching constructor for initialization of 'blink::(anonymous namespace)::V8FunctionExecutor'
  240 |     T* object = ::new (memory) T(std::forward<Args>(args)...);
      |                                ^ ~~~~~~~~~~~~~~~~~~~~~~~~

## Category
Pointer passed into spanified function parameter.

## Reason
The rewriter spanified the V8FunctionExecutor constructor to take a `base::span<v8::Local<v8::Value>> argv` parameter, but the call site in `PausableScriptExecutor::ExecuteFunction` is still passing a `v8::Local<v8::Value> argv[]`.  The rewriter failed to update this call site to construct a span from the array.

## Solution
The rewriter needs to find all call sites of the spanified function and update them to pass a span instead of a raw pointer.  In this case, the call in `PausableScriptExecutor::ExecuteFunction` needs to be updated to:

```c++
MakeGarbageCollected<V8FunctionExecutor>(
    isolate, function, receiver, argc,
    base::span<v8::Local<v8::Value>>(argv, argc));
```