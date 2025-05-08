# Build Failure Analysis: 2025_05_02_patch_1748

## First error

../../media/base/sinc_resampler_unittest.cc:288:17: error: no matching constructor for initialization of 'SincResampler'

## Category
Pointer passed into spanified function parameter.

## Reason
The function `SinusoidalLinearChirpSource::ProvideInput` was spanified, but the `base::BindRepeating` call was not updated to pass a `base::span`.  `base::BindRepeating` is attempting to pass a `float*` where a `base::span<float>` is expected. This means that the call site was not properly spanified.

## Solution
The rewriter needs to update the callsite of the spanified function.

## Note
```
../../media/base/sinc_resampler.h:57:3: note: candidate constructor not viable: no known conversion from 'RepeatingCallback<UnboundRunType>' to 'const RepeatingCallback<void (int, float *)>' for 3rd argument
   57 |   SincResampler(double io_sample_rate_ratio,
      |   ^
   58 |                 int request_frames,
   59 |                 const ReadCB read_cb);
      |                 ~~~~~~~~~~~~~~~~~~~~