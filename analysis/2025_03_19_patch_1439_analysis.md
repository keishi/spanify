# Build Failure Analysis: 2025_03_19_patch_1439

## First error

../../components/viz/test/gl_scaler_test_util.cc:267:38: error: no viable conversion from 'uint32_t *' (aka 'unsigned int *') to 'const base::span<const uint32_t>' (aka 'const span<const unsigned int>')

## Category
Rewriter needs to generate code to construct a span from the return value of a third_party function.

## Reason
The rewriter is trying to convert the return value of the third-party function `SkBitmap::getAddr32` to `base::span`. However, it does not generate code to construct a span from this return value.  The code was:

```c++
const uint32_t* const src = source.getAddr32(0, y);
```

and the rewriter incorrectly attempted to convert it into:

```c++
const base::span<const uint32_t> src = source.getAddr32(0, y);
```

Since `SkBitmap::getAddr32` returns a raw pointer, the rewriter needs to generate an appropriate span initialization, and it currently isn't doing that. `SkBitmap` is third party code, so we are not allowed to rewrite it.

## Solution
The rewriter needs to be able to recognize the return value of a third-party function call, and generate a span construction when assigning that return value to a span. Since the size is unknown, the span should be constructed from a pointer alone.

Since `SkBitmap::getAddr32` return value is assigned to `const base::span<const uint32_t> src`, rewriter needs to generate code like this:

```c++
const base::span<const uint32_t> src = base::make_span(source.getAddr32(0, y), result.width());
```

## Note
The first error occurs at line 267, in `GLScalerTestUtil::CreatePackedPlanarBitmap`.