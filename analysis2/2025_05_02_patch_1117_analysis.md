# Build Failure Analysis: 2025_05_02_patch_1117

## First error

../../third_party/blink/renderer/modules/webaudio/oscillator_handler.cc:504:19: error: no matching member function for call to 'WaveDataForFundamentalFrequency'
  504 |   periodic_wave_->WaveDataForFundamentalFrequency(
      |   ~~~~~~~~~~~~~~~~^~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

## Category
Pointer passed into spanified function parameter.

## Reason
The error message `no matching member function for call to 'WaveDataForFundamentalFrequency'` indicates that the function signature of `WaveDataForFundamentalFrequency` has changed, and the call site is no longer compatible.

In `oscillator_handler.cc`, `OscillatorHandler::ProcessKRate` calls `periodic_wave_->WaveDataForFundamentalFrequency`. The original code passed `float* lower_wave_data` and `float* higher_wave_data` as arguments. However, the `DoInterpolation` function signature was changed to accept `base::span<const float> higher_wave_data`. The rewriter failed to update the call site of the `WaveDataForFundamentalFrequency` to pass in spans instead of raw pointers.

```diff
--- a/third_party/blink/renderer/modules/webaudio/oscillator_handler.cc
+++ b/third_party/blink/renderer/modules/webaudio/oscillator_handler.cc
@@ -60,7 +62,7 @@ float DoInterpolation(double virtual_read_index,
                       unsigned read_index_mask,
                       float table_interpolation_factor,
                       const float* lower_wave_data,
-                      const float* higher_wave_data) {
+                      base::span<const float> higher_wave_data) {
   DCHECK_GE(incr, 0);
   DCHECK(std::isfinite(virtual_read_index));
 
@@ -491,7 +493,7 @@ double OscillatorHandler::ProcessKRate(int n,
   const double inv_periodic_wave_size = 1.0 / periodic_wave_size;
   const unsigned read_index_mask = periodic_wave_size - 1;
 
-  float* higher_wave_data = nullptr;
+  base::span<float> higher_wave_data = {};
   float* lower_wave_data = nullptr;
   float table_interpolation_factor = 0;

```

## Solution
The rewriter needs to find all call sites of a spanified function and update the arguments to match the new function signature. In this case, the rewriter should update the call to `periodic_wave_->WaveDataForFundamentalFrequency` in `OscillatorHandler::ProcessKRate` to pass a span instead of a raw pointer. Also, the definition of `higher_wave_data` needs to be changed from `float*` to `base::span<const float>`.

## Note
The other two errors reported in the build log are similar, and they both point to the same root cause.