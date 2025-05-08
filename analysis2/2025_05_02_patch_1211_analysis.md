# Build Failure Analysis: 2025_05_02_patch_1211

## First error
../../ui/events/ozone/evdev/touch_filter/palm_model/onedevice_train_palm_detection_filter_inference.cc:15375:3: error: no matching function for call to 'FullyConnected'

## Category
Pointer passed into spanified function parameter.

## Reason
The function `FullyConnected` was spanified, but the call site at line 15375 is still passing a raw pointer for the `input_values` argument.

## Solution
The rewriter failed to spanify the call site for `FullyConnected`. It needs to wrap the argument `input_values` at line 15375 with `base::span`. Because the size isn't available at the call site, it will create a compilation error because size is needed. Thus the rewriter should avoid spanifying `FullyConnected`.