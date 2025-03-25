# Build Failure Analysis: 2025_03_19_patch_644

## First error

../../mojo/public/cpp/system/tests/wait_set_unittest.cc:78:76: error: no viable conversion from 'HandleSignalsState[2]' to 'base::span<MojoHandleSignalsState>'

## Category
Rewriter failing to recognize raw pointer passed into spanified function.

## Reason
The `Wait` function in `WaitSet` class takes a `base::span<MojoHandleSignalsState>` as an argument. However, in the `wait_set_unittest.cc`, a raw C-style array `HandleSignalsState hss[2]` is being passed to the `Wait` function. The rewriter is failing to implicitly convert C-style array variable to span.

## Solution
The rewriter should convert the C-style array to `base::span` by using `base::make_span`

```c++
-  wait_set.Wait(nullptr, &num_ready_handles, ready_handles, ready_results, hss);
+  wait_set.Wait(nullptr, &num_ready_handles, ready_handles, ready_results, base::make_span(hss));
```

## Note
The `Wait` function was updated to take `base::span<MojoHandleSignalsState>` argument. Need to update the test call sites as well.
```
../../mojo/public/cpp/system/wait_set.h:115:48: note: passing argument to parameter 'signals_states' here
  115 |             base::span<MojoHandleSignalsState> signals_states = {});
      |                                                ^