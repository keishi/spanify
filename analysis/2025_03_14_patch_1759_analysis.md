# Build Failure Analysis: 2025_03_14_patch_1759

## First error

../../media/filters/wsola_internals.cc:378:23: error: no matching function for call to 'DecimatedSearch'
  378 |   int optimal_index = DecimatedSearch(
      |                       ^~~~~~~~~~~~~~~
../../media/filters/wsola_internals.cc:237:5: note: candidate function not viable: no known conversion from 'pointer' (aka 'float *') to 'base::span<const float>' for 6th argument
  237 | int DecimatedSearch(int decimation,

## Category
Pointer passed into spanified function parameter.

## Reason
The function `DecimatedSearch` was spanified, but the call site was not updated to pass a `base::span`. The code attempts to implicitly convert a raw `float*` to `base::span<const float>`, which is not allowed.

## Solution
The rewriter must also update call sites of spanified functions. The rewriter needs to wrap the `energy_candidate_blocks` argument at the call site with `base::span`.

For example:
```c++
  int optimal_index = DecimatedSearch(
      decimation, exclude_interval, target_block, search_segment,
      energy_target_block, base::span(energy_candidate_blocks, num_candidate_blocks));
```

## Note
This is a call site failure that should also have been modified by the span rewriter tool.