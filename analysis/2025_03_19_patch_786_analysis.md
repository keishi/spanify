# Build Failure Analysis: 2025_03_19_patch_786

## First error

../../components/gwp_asan/client/lightweight_detector/poison_metadata_recorder.cc:80:7: error: no matching function for call to 'Pack'
   80 |       Pack(reinterpret_cast<uintptr_t*>(trace), len,
      |       ^~~~
../../components/gwp_asan/common/pack_stack_trace.h:26:8: note: candidate function not viable: no known conversion from 'uintptr_t *' (aka 'unsigned long *') to 'base::span<const uintptr_t>' (aka 'span<const unsigned long>') for 1st argument
   26 | size_t Pack(base::span<const uintptr_t> unpacked,
      |        ^    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

## Category
Rewriter failing to recognize raw pointer passed to spanified function.

## Reason
The function `Pack` in `pack_stack_trace.h` was spanified, but the call site in `poison_metadata_recorder.cc` is passing a raw pointer (`uintptr_t*`) obtained via `reinterpret_cast`. The rewriter did not convert the raw pointer into a span, resulting in a type mismatch. This is a case where the rewriter failed to recognize that the pointer passed to the spanified function needs to be converted to a span using a temporary span object, because the size information is not available.

## Solution
The rewriter needs to recognize when a raw pointer is passed to a spanified function and generate code to convert the raw pointer to a span using a temporary span object with the length information. In this case, the rewriter should generate:

```c++
Pack(base::span<const uintptr_t>(reinterpret_cast<uintptr_t*>(trace), len), len,
```

## Note
It's important that the cast `reinterpret_cast<uintptr_t*>(trace)` isn't removed, as this is necessary for compilation.