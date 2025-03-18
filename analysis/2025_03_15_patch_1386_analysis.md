# Build Failure Analysis: 2025_03_15_patch_1386

## First error

../../components/viz/test/gl_scaler_test_util.cc:179:36: error: no viable conversion from 'uint32_t *' (aka 'unsigned int *') to 'const base::span<uint32_t>' (aka 'const span<unsigned int>')

## Category
Rewriter needs to generate code to construct a span from the return value of a third_party function.

## Reason
The code is trying to assign the raw pointer returned from `result.getAddr32(0, y)` to a `base::span<uint32_t>`. The rewriter doesn't generate the code to construct a `base::span` from a raw pointer. Because `result.getAddr32` is third party code, we cannot rewrite the third party code to return a span, so the rewriter needs to construct a span at the call site in our code.

## Solution
The rewriter should construct a `base::span` from the return value of `result.getAddr32` like this:

```c++
const base::span<uint32_t> pixels = base::span(result.getAddr32(0, y), result.width());
```

Or this subspan version:

```c++
const base::span<uint32_t> pixels = base::make_span(result.getAddr32(0, y), result.width());
```

The rewriter needs to determine the size of the span.

## Note
SkBitmap::getAddr32() is a third_party function call.
```
../../third_party/skia/include/core/SkBitmap.h