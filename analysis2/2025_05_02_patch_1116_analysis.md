# Build Failure Analysis: 2025_05_02_patch_1116

## First error

../../third_party/blink/renderer/modules/webaudio/oscillator_handler.cc:504:19: error: no matching member function for call to 'WaveDataForFundamentalFrequency'

## Category
Pointer passed into spanified function parameter.

## Reason
`PeriodicWave::WaveDataForFundamentalFrequency` expects a `float*&` as its second argument. However, `OscillatorHandler::ProcessKRate` is passing a `base::span<float>` called `lower_wave_data`. The rewriter spanified `DoInterpolation`, but failed to spanify `PeriodicWave::WaveDataForFundamentalFrequency` and the call site.

## Solution
Spanify `PeriodicWave::WaveDataForFundamentalFrequency` to expect a `base::span<float>` as its second argument, and the call site to properly convert to a span.

## Note
There are 3 total errors related to this issue.