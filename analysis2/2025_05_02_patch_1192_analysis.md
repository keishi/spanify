# Build Failure Analysis: 2025_05_02_patch_1192

## First error

../../ui/events/ozone/evdev/touch_filter/palm_model/onedevice_train_palm_detection_filter_inference.cc:816:1: error: no matching function for call to 'GetConvOutputSizeSAME'

## Category
Pointer passed into spanified function parameter.

## Reason
The rewriter spanified the `GetConvOutputSizeSAME` function, but failed to spanify the call site in the `POOL_OP` macro. The function now expects a `base::span<const int32_t>` but the call site is passing a raw `const int32_t*`.

## Solution
The rewriter needs to spanify the call site. This likely means adding `base::span` to the callsite. The rewriter should generate the following code:

```c++
base::span<const int32_t> input_shape_span(input_shape, 3);
GetConvOutputSizeSAME(input_shape_span, stride_y, stride_x);
```

## Note
There are multiple errors reported so the rewriter will need to spanify all call sites.
```