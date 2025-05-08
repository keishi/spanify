# Build Failure Analysis: 2025_05_02_patch_203

## First error

../../third_party/blink/renderer/modules/webaudio/cpu/x86/oscillator_kernel_sse2.cc:105:19: error: no matching member function for call to 'WaveDataForFundamentalFrequency'
  105 |   periodic_wave_->WaveDataForFundamentalFrequency(
      |   ~~~~~~~~~~~~~~~~^~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
../../third_party/blink/renderer/modules/webaudio/periodic_wave.h:101:8: note: candidate function not viable: no known conversion from 'base::span<float>' to 'float *&' for 2nd argument
  101 |   void WaveDataForFundamentalFrequency(float,
      |        ^
  102 |                                        float*& lower_wave_data,
      |                                        ~~~~~~~~~~~~~~~~~~~~~~~

## Category
Pointer passed into spanified function parameter.

## Reason
The rewriter spanified the variable `lower_wave_data`, but failed to spanify the function call site `periodic_wave_->WaveDataForFundamentalFrequency`. The function `WaveDataForFundamentalFrequency` expects a `float*&`, but it is receiving a `base::span<float>`.

## Solution
The rewriter needs to be able to spanify the call site of a function when the function signature is spanified. It should rewrite the call to `WaveDataForFundamentalFrequency` to take a `base::span<float>&` instead of a `float*&`.