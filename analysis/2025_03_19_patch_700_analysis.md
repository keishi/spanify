```
# Build Failure Analysis: 2025_03_19_patch_700

## First error

../../media/base/sinc_resampler.cc:325:21: error: cannot increment value of type 'base::span<float>'

## Category
Rewriter failed to apply subspan rewrite to a spanified return value.

## Reason
The rewriter changed `Resample` to take a `base::span<float>` instead of a `float*`. As part of that change, it attempted to rewrite `*destination++ =` to `(destination++)[0] =`. However, the rewriter didn't fully account for the fact that `destination` is now a `base::span<float>`, and thus `destination++` is invalid.

## Solution
The rewriter needs to be updated to properly apply subspan rewrite to a spanified return value.
The rewriter should generate something like:

```c++
float& dest = destination[0];
dest = convolve_proc_(kernel_size_, input_ptr, k1, k2, kernel_interpolation_factor);
destination = destination.subspan(1);
```

## Note
There's another error after this one with a similar cause.