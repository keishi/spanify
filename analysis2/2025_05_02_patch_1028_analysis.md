# Build Failure Analysis: 2025_05_02_patch_1028

## First error

```
../../media/filters/wsola_internals.cc:438:23: error: no matching function for call to 'DecimatedSearch'
  438 |   int optimal_index = DecimatedSearch(
      |                       ^~~~~~~~~~~~~~~
../../media/filters/wsola_internals.cc:297:5: note: candidate function not viable: no known conversion from 'pointer' (aka 'float *') to 'base::span<const float>' for 5th argument
  297 | int DecimatedSearch(int decimation,
      |     ^
```

## Category
Pointer passed into spanified function parameter.

## Reason
The function `DecimatedSearch` was spanified, but the call site at `wsola_internals.cc:438` is passing a raw pointer for the `energy_target_block` argument. The rewriter did not recognize that the size of `energy_target_block` was not available.

## Solution
The rewriter needs to recognize that the call site needs to be updated to pass in a span.

## Note
Also the function `FullSearch` had same issue.
```
../../media/filters/wsola_internals.cc:445:10: error: no matching function for call to 'FullSearch'
  445 |   return FullSearch(lim_low, lim_high, exclude_interval, target_block,
      |          ^~~~~~~~~~
../../media/filters/wsola_internals.cc:376:5: note: candidate function not viable: no known conversion from 'pointer' (aka 'float *') to 'base::span<const float>' for 6th argument
  376 | int FullSearch(int low_limit,
      |     ^