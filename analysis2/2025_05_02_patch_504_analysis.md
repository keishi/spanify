# Build Failure Analysis: 2025_05_02_patch_504

## First error

../../media/base/sinc_resampler_perftest.cc:64:5: error: no matching function for call to 'RunConvolveBenchmark'
   64 |     RunConvolveBenchmark(SincResampler::Convolve_SSE, true,
      |     ^~~~~~~~~~~~~~~~~~~~
../../media/base/sinc_resampler_perftest.cc:27:13: note: candidate function not viable: no known conversion from 'float (const int, base::span<const float>, const float *, const float *, double)' to 'float (*)(const int, const float *, const float *, const float *, double)' for 1st argument

## Category
Pointer passed into spanified function parameter.

## Reason
The rewriter spanified the `input_ptr` parameter of `SincResampler::Convolve_SSE`, but did not update the call site in `RunConvolveBenchmark`. The `RunConvolveBenchmark` function expects a `float*`, but it is now receiving `base::span<const float>`.

## Solution
The rewriter needs to spanify the `RunConvolveBenchmark` function, or add `.data()` when calling the function in `RunConvolveBenchmark`.

## Note