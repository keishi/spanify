# Build Failure Analysis: 2025_03_19_patch_819

## First error

../../media/base/sinc_resampler_unittest.cc:288:17: error: no matching constructor for initialization of 'SincResampler'
  288 |   SincResampler resampler(
      |                 ^
  289 |       io_ratio, SincResampler::kDefaultRequestSize,

## Category
Pointer passed into spanified function parameter.

## Reason
The rewriter spanified a function, but failed to spanify a call site. `ProvideInput` now takes a `base::span<float>` argument, but the call site at `pure_source.ProvideInput` is still passing a raw float*.

## Solution
The rewriter should also rewrite the call site to `pure_source.ProvideInput(output_samples, pure_destination);` to `pure_source.ProvideInput(output_samples, pure_destination);`

## Note
None