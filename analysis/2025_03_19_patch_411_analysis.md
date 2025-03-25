# Build Failure Analysis: 2025_03_19_patch_411

## First error

../../third_party/blink/renderer/modules/webaudio/oscillator_handler.cc:443:19: error: no matching member function for call to 'WaveDataForFundamentalFrequency'

## Category
Pointer passed into spanified function parameter.

## Reason
The function `PeriodicWave::WaveDataForFundamentalFrequency` has been spanified, but the call site `OscillatorHandler::ProcessKRateScalar` is passing a raw pointer. This is because a local variable `higher_wave_data` which should have been a raw pointer is now base::span<float>.

## Solution
The rewriter should not have spanified `higher_wave_data` since it is being passed as a non-spanified argument to another function. Removing the spanification will fix this.

```diff
--- a/third_party/blink/renderer/modules/webaudio/oscillator_handler.cc
+++ b/third_party/blink/renderer/modules/webaudio/oscillator_handler.cc
@@ -434,7 +436,7 @@
   const double inv_periodic_wave_size = 1.0 / periodic_wave_size;
   const unsigned read_index_mask = periodic_wave_size - 1;
 
-  base::span<float> higher_wave_data = {};
+  float* higher_wave_data = nullptr;
   float* lower_wave_data = nullptr;
   float table_interpolation_factor = 0;