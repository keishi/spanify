# Build Failure Analysis: 2025_05_02_patch_1546

## First error

../../media/filters/wsola_internals.cc:312:19: error: no matching function for call to 'MultiChannelSimilarityMeasure'
  312 |   similarity[0] = MultiChannelSimilarityMeasure(
      |                   ^~~~~~~~~~~~~~~~~~~~~~~~~~~~~
../../media/filters/wsola_internals.cc:41:7: note: candidate function not viable: no known conversion from 'const float *' to 'base::span<const float>' for 3rd argument
   41 | float MultiChannelSimilarityMeasure(const float* dot_prod_a_b,
      |       ^
   42 |                                     const float* energy_a,
   43 |                                     base::span<const float> energy_b,
      |                                     ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

## Category
Pointer passed into spanified function parameter.

## Reason
The function `MultiChannelSimilarityMeasure` was spanified, but the call sites in `WSOLA::BuildSimilarityMatrix` pass raw pointers for the `energy_b` argument, leading to a type mismatch. The rewriter updated the function signature, but failed to update the call sites to pass a `base::span<const float>` instead of a `const float*`.

## Solution
The rewriter should identify the call sites of the function and transform the raw pointer arguments into `base::span` objects. Since the size is likely available at the call site, the rewrite should involve constructing a `base::span` from the pointer and size. For example, if the size is `channels`, the call site should be modified as follows:

```c++
-  similarity[0] = MultiChannelSimilarityMeasure(dot_prod_a_b, energy_a, energy_b, channels);
+  similarity[0] = MultiChannelSimilarityMeasure(dot_prod_a_b, energy_a, base::span<const float>(energy_b, channels), channels);
```

## Note
The rewriter updated the function declaration but failed to update the call sites.
```