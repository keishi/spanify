# Build Failure Analysis: 2025_03_14_patch_1758

## First error

../../media/filters/wsola_internals.cc:378:23: error: no matching function for call to 'DecimatedSearch'
  378 |   int optimal_index = DecimatedSearch(
      |                       ^~~~~~~~~~~~~~~

## Category
Pointer passed into spanified function parameter.

## Reason
The rewriter spanified the `DecimatedSearch` and `FullSearch` functions, but failed to spanify the call sites. The error message indicates that there is no matching function because the arguments passed at the call site are raw pointers, but the function now expects a `base::span`.

## Solution
The rewriter needs to identify all call sites of spanified functions and update the call sites to pass spans instead of raw pointers. In this case, the `energy_target_block` argument in both `DecimatedSearch` and `FullSearch` need to be converted to a span at the call site.

```diff
--- a/media/filters/wsola_internals.cc
+++ b/media/filters/wsola_internals.cc
@@ -375,7 +375,8 @@
   }
 
   int optimal_index = DecimatedSearch(
-      decimation, exclude_interval, target_block, search_segment, energy_target_block);
+      decimation, exclude_interval, target_block, search_segment,
+      base::span<const float>(energy_target_block, target_block->frames()));
 
   if (optimal_index < 0)
     return optimal_index;
@@ -382,8 +383,10 @@
   lim_low = std::max(0, optimal_index - 2);
   lim_high = std::min(static_cast<int>(search_segment->frames() - block_size),
                        optimal_index + 2);
-  return FullSearch(lim_low, lim_high, exclude_interval, target_block, search_segment,
-                    energy_target_block, energy_candidate_blocks);
+  return FullSearch(
+      lim_low, lim_high, exclude_interval, target_block, search_segment,
+      base::span<const float>(energy_target_block, target_block->frames()),
+      energy_candidate_blocks);
 }
 
 }  // namespace media

```

## Note
There is also another error in the build failure log.