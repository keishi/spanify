# Build Failure Analysis: 2025_03_19_patch_406

## First error

../../third_party/blink/renderer/modules/webaudio/oscillator_handler.cc:501:19: error: no matching member function for call to 'WaveDataForFundamentalFrequency'

## Category
Pointer passed into spanified function parameter.

## Reason
The function `WaveDataForFundamentalFrequency()` expects a `float*& lower_wave_data`. However, the variable `lower_wave_data` has been changed to `base::span<float> lower_wave_data = {};`. The type doesn't match.

## Solution
The rewriter changed a function signature to use `base::span`, but it failed to update the function calls to pass in a `base::span`. To solve this, the rewriter must locate the function call and pass in a span to the function.

## Note
The other errors are related to the first error:
```
../../third_party/blink/renderer/modules/webaudio/oscillator_handler.cc:589:13: error: no matching function for call to 'DoInterpolation'
../../third_party/blink/renderer/modules/webaudio/oscillator_handler.cc:59:7: note: candidate function not viable: no known conversion from 'float *' to 'base::span<const float>' for 5th argument

../../third_party/blink/renderer/modules/webaudio/oscillator_handler.cc:628:21: error: no matching member function for call to 'WaveDataForFundamentalFrequency'
../../third_party/blink/renderer/modules/webaudio/periodic_wave.h:101:8: note: candidate function not viable: no known conversion from 'base::span<float>' to 'float *&' for 2nd argument