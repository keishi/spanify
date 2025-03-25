# Build Failure Analysis: 2025_03_19_patch_1440

## First error

../../components/viz/test/gl_scaler_test_util.cc:268:32: error: no viable conversion from 'uint32_t *' (aka 'unsigned int *') to 'const base::span<uint32_t>' (aka 'const span<unsigned int>')
  268 |     const base::span<uint32_t> dst = result.getAddr32(0, y);

## Category
Rewriter needs to generate code to construct a span from the return value of a third_party function.

## Reason
The code `result.getAddr32(0, y)` returns a raw pointer (`uint32_t*`). The rewriter attempts to initialize a `base::span<uint32_t>` directly with this raw pointer. However, `base::span` needs to know the size of the underlying data. In this case, the size information is not readily available from the raw pointer itself. The `getAddr32` function is third_party code, which is SkBitmap::getAddr32().

## Solution
The rewriter needs to generate explicit code to construct a `base::span` from the raw pointer returned by the third-party function. Since `getAddr32` returns a pointer to a row in the SkBitmap, and we know the width of the row, the rewriter should generate:

```c++
const base::span<uint32_t> dst(result.getAddr32(0, y), result.width());
```

## Note
`SkBitmap::getAddr32` is a third_party function, therefore its code cannot be rewritten by spanify.