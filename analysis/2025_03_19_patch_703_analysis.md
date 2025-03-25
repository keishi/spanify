# Build Failure Analysis: 2025_03_19_patch_703

## First error
../../media/base/sinc_resampler_perftest.cc:54:3: error: no matching function for call to 'RunConvolveBenchmark'
   54 |   RunConvolveBenchmark(SincResampler::Convolve_C, true, "unoptimized_aligned");

## Category
Pointer passed into spanified function parameter.

## Reason
The rewriter spanified `SincResampler::Convolve_C`, but failed to update the call site in `RunConvolveBenchmark` since the function pointer type definition in `RunConvolveBenchmark` does not match the updated function signature after spanification.

## Solution
The rewriter spanified a function `SincResampler::Convolve_C`, but failed to spanify a call site `RunConvolveBenchmark`. Thus the rewriter needs to avoid spanifying functions if it requires spanifying call sites in code that was not rewritten (i.e. generated code, third party code, or code that didn't get rewritten for some reason).  The signature for `RunConvolveBenchmark` needs to be updated to handle base::span, or `SincResampler::Convolve_C` must not be spanified.

## Note
None