# Build Failure Analysis: 2025_03_19_patch_782

## First error

../../media/base/sinc_resampler_perftest.cc:61:5: error: no matching function for call to 'RunConvolveBenchmark'

## Category
Pointer passed into spanified function parameter.

## Reason
The rewriter spanified the `k2` argument of `SincResampler::Convolve_AVX2` from `const float*` to `base::span<const float>`, but it failed to update the call sites in `sinc_resampler_perftest.cc`. This resulted in a type mismatch when passing `SincResampler::Convolve_AVX2` as an argument to `RunConvolveBenchmark`, which still expects a function with a `const float*` argument.

## Solution
The rewriter should also update the call sites of `SincResampler::Convolve_AVX2` in `sinc_resampler_perftest.cc` to pass a `base::span<const float>` instead of a `const float*`. There are two call sites and both need to have the third argument rewritten.

```c++
    RunConvolveBenchmark(SincResampler::Convolve_AVX2, true, kernel2.data(), kernel_interpolation_factor);
```

The rewriter should change this to

```c++
    RunConvolveBenchmark(SincResampler::Convolve_AVX2, true, kernel2, kernel_interpolation_factor);
```

Also,

```c++
    RunConvolveBenchmark(SincResampler::Convolve_AVX2, false, kernel2.data(), kernel_interpolation_factor);
```

The rewriter should change this to

```c++
    RunConvolveBenchmark(SincResampler::Convolve_AVX2, false, kernel2, kernel_interpolation_factor);
```

## Note
The `Convolve_AVX2` function is only called in `sinc_resampler_perftest.cc`. This is a unit test for `SincResampler`. It might make sense to move this function to the test file.