# Build Failure Analysis: 2025_05_02_patch_828

## First error

../../third_party/blink/renderer/platform/fonts/opentype/open_type_vertical_data.cc:290:21: error: invalid operands to binary expression ('base::span<float>' and 'float *')

## Category
Rewriter failed to apply subspan rewrite to a spanified return value.

## Reason
The rewriter has converted the argument `float* out_xy_array` to `base::span<float> out_xy_array`. The code contains a loop, but failed to transform the loop increment expression correctly. The variable `out_xy_array` is being compared to a `float* end` in the condition, which is not allowed.

## Solution
The rewriter should recognize this loop pattern and apply the subspan rewrite to a spanified variable.

## Note
Multiple errors were generated by this failed rewrite.