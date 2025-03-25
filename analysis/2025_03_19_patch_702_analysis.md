# Build Failure Analysis: 2025_03_19_patch_702

## First error

../../media/base/sinc_resampler.cc:141:22: error: assigning to 'ConvolveProc' (aka 'float (*)(const int, const float *, const float *, const float *, double)') from incompatible type 'float (const int, const float *, base::span<const float>, const float *, double)': type mismatch at 3rd parameter ('const float *' vs 'base::span<const float>')

## Category
Rewriter needs to avoid spanifying functions if it requires spanifying excluded code.

## Reason
The rewriter changed the type of `k1` in the definition of `SincResampler::Convolve_C` to `base::span<const float>`, but the type of `convolve_proc_` was `float (*)(const int, const float *, const float *, const float *, double)`. This means that the rewriter spanified `SincResampler::Convolve_C` function, but forgot to update function pointers that point to this function. It would be best if the rewriter avoided changing the signature of functions if that requires updating function pointers (or other call sites) in files that the rewriter does not have the information to update.

## Solution
The rewriter should avoid spanifying `SincResampler::Convolve_C` because `SincResampler::convolve_proc_` is a function pointer that is incompatible with the spanified version.

## Note
There is also a second error that may or may not be caused by the same problem:

../../media/base/sinc_resampler.cc:398:29: error: cannot increment value of type 'base::span<const float>'
  398 |     sum1 += *input_ptr * (k1++)[0];
      |                           ~~^