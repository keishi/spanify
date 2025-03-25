# Build Failure Analysis: 2025_03_19_patch_778

## First error

../../media/base/sinc_resampler_perftest.cc:64:5: error: no matching function for call to 'RunConvolveBenchmark'

## Category
Pointer passed into spanified function parameter.

## Reason
The rewriter spanified `SincResampler::Convolve_SSE`, but failed to update the call sites in the perftest file. The test is trying to pass a `float*` into a function that now takes `base::span<const float>`.

## Solution
The rewriter should also update the call sites to `SincResampler::Convolve_SSE`. Ideally this should be automatic.

## Note
This is the secondary error:
```
../../media/base/sinc_resampler_perftest.cc:79:5: error: no matching function for call to 'RunConvolveBenchmark'