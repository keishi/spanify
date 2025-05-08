# Build Failure Analysis: 2025_05_02_patch_1632

## First error

../../components/gwp_asan/client/lightweight_detector/poison_metadata_recorder.cc:80:7: error: no matching function for call to 'Pack'

## Category
Rewriter failing to recognize raw pointer passed to spanified function.

## Reason
The function `Pack` has been spanified to take `base::span<const uintptr_t>`, but the call site in `poison_metadata_recorder.cc` is passing a raw `uintptr_t*`. The rewriter failed to recognize this raw pointer and convert it to a `base::span`. It couldn't deduce the size of the stack trace `trace`.

## Solution
The rewriter needs to wrap the raw pointer `trace` with `base::span` using the size `len` to construct the `base::span`.

```c++
Pack(base::span<const uintptr_t>(reinterpret_cast<uintptr_t*>(trace), len), len,
```

## Note
The code uses `reinterpret_cast`, which might indicate a deeper issue with type safety. However, the primary goal is to fix the immediate build failure.