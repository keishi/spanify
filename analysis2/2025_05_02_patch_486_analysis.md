# Build Failure Analysis: 2025_05_02_patch_486

## First error

../../sandbox/linux/bpf_dsl/test_trap_registry_unittest.cc:40:25: error: variable 'funcs' declared with deduced type 'auto' cannot appear in its own initializer

## Category
Rewriter does not handle assignment of spanified variable from std::begin/end.

## Reason
The original code was using a C-style array. The rewriter converted it to `std::to_array`. However, the `funcs.data()` is used to initialize one of the members of the array which is assigned using `auto`. Thus `funcs` is being used in its own initialization.

## Solution
The rewriter needs to create a temporary variable to initialize it.
```c++
  struct Funcs {
    TrapRegistry::TrapFnc fnc;
    raw_ptr<const void> aux;
  };
  void* funcs_data;
  auto funcs = std::to_array<Funcs>({
      {TestTrapFuncOne, nullptr},
      {TestTrapFuncTwo, nullptr},
      {TestTrapFuncOne, funcs_data},
      {TestTrapFuncTwo, funcs_data},
  });
```

## Note