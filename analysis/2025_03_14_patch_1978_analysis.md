# Build Failure Analysis: 2025_03_14_patch_1978

## First error

../../ui/gfx/half_float_unittest.cc:63:22: error: no matching conversion for functional-style cast from 'float *' to 'base::span<float, 1>'

## Category
Pointer passed into spanified function parameter.

## Reason
The rewriter spanified `FloatToHalfFloat`, but failed to spanify the call site in `HalfFloatTest::Convert`. Specifically, the rewriter expected the argument to `FloatToHalfFloat` to be `base::span<const float>`, but it was given a `float*`.

## Solution
The rewriter needs to spanify both the function and the call site.

## Note
There were other files that failed to compile as well. The error in `ui/gfx/half_float_unittest.cc` is the root cause.
```
../../ui/gfx/half_float_unittest.cc:63:22: error: no matching conversion for functional-style cast from 'float *' to 'base::span<float, 1>'
   63 |     FloatToHalfFloat(base::span<float, 1>(&f), &ret, 1);
      |                      ^~~~~~~~~~~~~~~~~~~~~~~~