# Build Failure Analysis: 2025_03_19_patch_780

## First error

../../media/base/sinc_resampler.cc:137:22: error: assigning to 'ConvolveProc' (aka 'float (*)(const int, const float *, const float *, const float *, double)') from incompatible type 'float (const int, const float *, base::span<const float>, const float *, double)': type mismatch at 3rd parameter ('const float *' vs 'base::span<const float>')

## Category
Pointer passed into spanified function parameter.

## Reason
The rewriter spanified the `Convolve_AVX2` function, but failed to update the function pointer `convolve_proc_` to accept a `base::span<const float>` as the third argument. As a result, the function pointer has an incompatible signature.

## Solution
The rewriter needs to update function pointers (like `convolve_proc_`) when the type signatures of the functions they point to are modified, in the call sites too. In this case, the fix would involve changing the type of `convolve_proc_` to accept base::span<const float>

## Note
The error suggests that this function pointer is assigned different function depending on CPU architecture, and all such call sites may also need to be rewritten to account for `base::span`.