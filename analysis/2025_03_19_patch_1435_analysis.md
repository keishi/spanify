# Build Failure Analysis: 2025_03_19_patch_1435

## First error

../../components/viz/test/gl_scaler_test_util.cc:160:36: error: no viable conversion from 'uint32_t *' (aka 'unsigned int *') to 'const base::span<uint32_t>' (aka 'const span<unsigned int>')

## Category
Rewriter failing to recognize raw pointer passed to spanified function.

## Reason
The rewriter spanified a function `SkBitmap::getAddr32`, but failed to spanify a call site.  The `getAddr32` function returns a `uint32_t*`, which the rewriter was unable to convert to a `base::span<uint32_t>`.  

The root cause of the error is the rewriter failing to recognize a size info unavailable rhs value.

## Solution
The rewriter should construct a `base::span<uint32_t>` from the pointer returned by `result.getAddr32(0, y)` along with the size using `size.width()`. 

Here is the suggested code:
```c++
        const base::span<uint32_t> pixels(result.getAddr32(0, y), size.width());
```

## Note
None