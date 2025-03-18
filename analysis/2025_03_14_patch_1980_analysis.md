# Build Failure Analysis: 2025_03_14_patch_1980

## First error

../../ui/base/clipboard/clipboard_test_template.h:614:28: error: no viable conversion from 'const U8x4 *' (aka 'const array<unsigned char, 4> *') to 'base::span<const U8x4>' (aka 'span<const array<unsigned char, 4>>')

## Category
Rewriter needs to support implicit conversion from raw pointer to base::span.

## Reason
The rewriter changed `const U8x4*` to `base::span<const U8x4>`, but `image.getAddr32(0, y)` returns `const U8x4*`. There is no implicit conversion from raw pointer to `base::span`. The rewriter should either generate a `base::span` from the raw pointer, or leave the original raw pointer alone.

```
  614 |     base::span<const U8x4> actual_row =
      |                            ^
  615 |         reinterpret_cast<const U8x4*>(image.getAddr32(0, y));
      |         ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
```

## Solution
The rewriter should generate code to construct a span from the return value of `image.getAddr32(0, y)`, but the size is already known via `image.width()`. It should generate the following code:
```c++
base::span<const U8x4> actual_row = base::span<const U8x4>(reinterpret_cast<const U8x4*>(image.getAddr32(0, y)), image.width());
```

## Note
There are no other errors.