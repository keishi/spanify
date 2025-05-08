# Build Failure Analysis: 2025_05_02_patch_1189

## First error

../../ui/events/ozone/evdev/touch_filter/palm_model/onedevice_train_palm_detection_filter_inference.cc:816:1: error: no matching function for call to 'GetConvOutputSizeVALID'
  816 | POOL_OP(Max, std::numeric_limits<T>::lowest(), std::max(value, next), value)
      | ^~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
../../ui/events/ozone/evdev/touch_filter/palm_model/onedevice_train_palm_detection_filter_inference.cc:798:9: note: expanded from macro 'POOL_OP'
  798 |         GetConvOutputSizeVALID(input_shape, kernel_shape, stride_y, stride_x); \
      |         ^~~~~~~~~~~~~~~~~~~~~~
../../ui/events/ozone/evdev/touch_filter/palm_model/onedevice_train_palm_detection_filter_inference.cc:132:29: note: candidate function not viable: no known conversion from 'const int32_t *__restrict' (aka 'const int *__restrict') to 'base::span<const int32_t>' (aka 'span<const int>') for 1st argument
  132 | inline std::tuple<int, int> GetConvOutputSizeVALID(
      |                             ^
  133 |     base::span<const int32_t> input_shape,
      |     ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

## Category
Pointer passed into spanified function parameter.

## Reason
The rewriter has spanified `GetConvOutputSizeVALID` but failed to spanify the call site at the macro `POOL_OP`. The error message indicates that there is no viable conversion from `const int32_t*` to `base::span<const int32_t>`. This means the code at the call site is passing a raw pointer where a span is expected.

## Solution
The rewriter should convert the `input_shape` argument at the call site to a `base::span`. Since the size of `input_shape` is not available at the call site inside the macro, the rewriter should not have spanified the function in the first place.

The rewriter needs to avoid spanifying functions if it requires spanifying excluded code.