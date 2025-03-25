# Build Failure Analysis: 2025_03_19_patch_171

## First error
../../third_party/blink/renderer/modules/webaudio/cpu/x86/oscillator_kernel_sse2.cc:103:19: error: no matching member function for call to 'WaveDataForFundamentalFrequency'

## Category
Pointer passed into spanified function parameter.

## Reason
The function `PeriodicWave::WaveDataForFundamentalFrequency` was not spanified, but a spanified variable `lower_wave_data` was passed into it.

## Solution
The rewriter needs to spanify the function `PeriodicWave::WaveDataForFundamentalFrequency` or avoid spanifying the call site. It's usually better to spanify the call site if the function is third party.

## Note
There are two candidate functions for `WaveDataForFundamentalFrequency`. The error says `no known conversion from 'base::span<float>' to 'float *&'` which would occur if the first candidate was chosen, and the second parameter is spanified. The error also says `no known conversion from 'float' to 'const float *'` which means that the second candidate was chosen, and the first parameter requires the address of the `float` to be passed in.