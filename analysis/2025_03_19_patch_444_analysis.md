# Build Failure Analysis: 2025_03_19_patch_444

## First error

../../remoting/codec/codec_test.cc:135:33: error: no viable conversion from 'uint8_t *' (aka 'unsigned char *') to 'base::span<const uint8_t>' (aka 'span<const unsigned char>')
  135 |       base::span<const uint8_t> expected =
      |                                 ^
  136 |           expected_frame_->GetFrameDataAtPos(i.rect().top_left());
      |           ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

## Category
Rewriter needs to generate code to construct a span from the return value of a third_party function.

## Reason
The code attempts to assign the raw pointer returned by `expected_frame_->GetFrameDataAtPos()` directly to a `base::span<const uint8_t>`.  The rewriter needs to generate code to create a span from the return value. It's a third party function, so we shouldn't rewrite it. The rewriter has failed to generate the correct code for constructing a span from the return value.

## Solution
The rewriter should generate code to construct a span from the returned raw pointer and length, instead of directly assigning the return value. Example:

```c++
base::span<const uint8_t> expected = base::span(expected_frame_->GetFrameDataAtPos(i.rect().top_left()), i.rect().width() * kBytesPerPixel);
```

It needs to determine the appropriate size to use in the construction of the span.  Since the function is `GetFrameDataAtPos`, the size is derived from the `i.rect().width()` multiplied by the number of bytes per pixel. This is not always possible to automatically deduce.

## Note
There are additional errors:

1.  The `CalculateError` function now takes a `base::span<const uint8_t>` as the first argument, but `static_cast<double>((original++)[0])` attempts to increment the span which is invalid since spans do not support increment.

2.  `expected` is now a `base::span<const uint8_t>`, so the `expected += expected_frame_->stride();` line is no longer valid. It attempts to increment a span, but span does not support ++.

These secondary errors may be fixed if the first error is fixed correctly.