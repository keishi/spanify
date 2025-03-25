# Build Failure Analysis: 2025_03_19_patch_1914

## First error

../../media/filters/wsola_internals.cc:433:23: error: no matching function for call to 'DecimatedSearch'

## Category
Rewriter failing to recognize raw pointer passed to spanified function.

## Reason
The function `DecimatedSearch` that this argument is being passed to was spanified, but this call site is passing a raw pointer where the size is not available. The span version was created by the rewriter here:

```diff
+++ b/media/filters/wsola_internals.h
@@ -54,7 +54,7 @@
                                  Interval exclude_interval,
                                  const AudioBus* target_block,
                                  const AudioBus* search_segment,
-                                 const float* energy_target_block,
+                                 base::span<const float> energy_target_block,
                                  const float* energy_candid_blocks);
```

## Solution
The rewriter needs to handle the case where a function has been spanified, but a call site does not have size information for an argument.

## Note
The second error is the exact same.

```
../../media/filters/wsola_internals.cc:440:10: error: no matching function for call to 'FullSearch'