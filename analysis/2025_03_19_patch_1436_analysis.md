```
# Build Failure Analysis: 2025_03_19_patch_1436

## First error

../../components/viz/test/gl_scaler_test_util.cc:179:36: error: no viable conversion from 'uint32_t *' (aka 'unsigned int *') to 'const base::span<uint32_t>' (aka 'const span<unsigned int>')
  179 |         const base::span<uint32_t> pixels = result.getAddr32(0, y);
      |                                    ^        ~~~~~~~~~~~~~~~~~~~~~~

## Category
Rewriter needs to generate code to construct a span from the return value of a third_party function.

## Reason
`SkBitmap::getAddr32` is a third-party function that returns a raw pointer (`uint32_t*`). The rewriter should generate code to construct a span from the return value of this third_party function. In this case, the size of the span is not obviously available.

## Solution
The rewriter needs to generate `base::span` construction for the returned raw pointer. Because the size is not known, the span must be created without size. This needs a test case.

The rewriter should generate:

```c++
const base::span<uint32_t> pixels =
    base::span(result.getAddr32(0, y), size);
```

## Note