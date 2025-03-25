```
# Build Failure Analysis: 3068

## First error

../../components/viz/test/gl_scaler_test_util.cc:242:32: error: no viable conversion from 'uint32_t *' (aka 'unsigned int *') to 'const base::span<uint32_t>' (aka 'const span<unsigned int>')

## Category
Pointer passed into spanified function parameter.

## Reason
`SkBitmap::getAddr32` returns a `uint32_t*`. But the code is trying to assign this to a `base::span<uint32_t>`. The rewriter spanified a function, but failed to spanify a call site.

## Solution
The rewriter should recognize this call site and convert the raw pointer to a span.

## Note

```
../../base/containers/span.h:373:5: note: because 'unsigned int *' does not satisfy 'contiguous_range'
   373 |     std::ranges::contiguous_range<R> && std::ranges::sized_range<R> &&
```

This error message is telling us that the compiler failed to find the correct constructor of `base::span`. `base::span` doesn't know how to implicitly construct from a raw pointer, it needs the size.