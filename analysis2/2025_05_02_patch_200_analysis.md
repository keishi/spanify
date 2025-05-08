# Build Failure Analysis: 2025_05_02_patch_200

## First error

../../mojo/core/multiprocess_message_pipe_unittest.cc:827:24: error: no viable conversion from 'value_type *' (aka 'mojo::Handle *') to 'base::span<const Handle>'

## Category
Rewriter failing to recognize raw pointer passed to spanified function.

## Reason
The function `mojo::WaitMany` was spanified:
```c++
MOJO_CPP_SYSTEM_EXPORT MojoResult
WaitMany(base::span<const Handle> handles,
         const MojoHandleSignals* signals,
         size_t num_handles,
         size_t* result_index = nullptr,
         MojoHandleSignalsState* signals_states = nullptr);
```

The original code was passing `handles.data()` to the function, which is a raw pointer.
```c++
MojoResult rv =
          WaitMany(wh, sigs.data(), wh.size(), &result_index, states.data());
```

The type of `wh` is `std::vector<Handle>`. The rewriter failed to recognize that `handles.data()` is a raw pointer, even though `handles.size()` is available.

## Solution
The rewriter needs to recognize the pattern where a raw pointer obtained via `std::vector::data()` or similar is passed to a spanified function, and create a span at the call site.

## Note
The original code passed `wh.data()` to `WaitMany`, but the spanified code is passing `wh` directly. This is incorrect.
```c++
-    MojoResult rv = WaitMany(wh.data(), sigs.data(), wh.size(), &result_index);
+    MojoResult rv = WaitMany(wh, sigs.data(), wh.size(), &result_index);
```
This pattern also appears in two other places.