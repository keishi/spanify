# Build Failure Analysis: 2025_05_02_patch_1224

## First error
../../ui/events/ozone/evdev/touch_filter/palm_model/onedevice_train_palm_detection_filter_inference.cc:500:17: error: member reference base type 'int' is not a structure or union

## Category
Rewriter added .data() to a variable/member it did not spanify/arrayify.

## Reason
The original code was:
```c++
T* out = output_values +
                 (((out_batch * output_height + out_h) * output_width + out_w) *
                      output_depth +
                  0);
```

The rewriter spanified `output_values` and added `.subspan()` to it. However, it incorrectly added `.data()` inside the `subspan` call. The `.data()` method should not be called on the result of an integer calculation. It seems the rewriter mistakenly assumed that the result of the `subspan` expression was still a span, but it is actually a pointer.

## Solution
The rewriter should not have added `.data()` inside the `subspan` expression. It should have either added it *after* the `subspan` call if that expression resulted in `base::span`. In this case, the expression is not `base::span` so it shouldn't have added `.data()` at all.

Remove the erroneous `.data()` call.

## Note
None