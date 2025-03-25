# Build Failure Analysis: 2025_03_19_patch_1444

## First error

../../components/viz/test/gl_scaler_test_util.cc:376:32: error: no viable conversion from 'uint32_t *' (aka 'unsigned int *') to 'const base::span<uint32_t>' (aka 'const span<unsigned int>')
  376 |     const base::span<uint32_t> dst = out->getAddr32(0, y);

## Category
Rewriter needs to generate code to construct a span from the return value of a third_party function.

## Reason
The code attempts to assign the raw pointer returned by `SkBitmap::getAddr32()` to a `base::span`. The compiler error indicates that there is no implicit conversion from a raw pointer (`uint32_t*`) to a `base::span<uint32_t>`. The rewriter needs to generate code to explicitly construct a `base::span` from the raw pointer, but it's failing to do so.  The size is not known in this context and should be a dynamic size span.

## Solution
The rewriter needs to explicitly construct a `base::span` when assigning the result of `SkBitmap::getAddr32()` to a `base::span`. The rewriter should recognize this pattern and generate `base::span<uint32_t>(out->getAddr32(0, y), out->width())`. The corrected line should read:

```c++
const base::span<uint32_t> dst = base::span<uint32_t>(out->getAddr32(0, y), out->width());
```

## Note
`SkBitmap::getAddr32()` is third_party code, and its return value should not be spanified. The rewriter should instead generate code to create a span object from the returned pointer. Also, the size of the span is the width of the output bitmap. The documentation says that these raw pointers returned from `getAddr32` are known to be valid for the lifetime of the SkBitmap.