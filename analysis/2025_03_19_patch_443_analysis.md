# Build Failure Analysis: 2025_03_19_patch_443

## First error

../../remoting/codec/codec_test.cc:113:33: error: no viable conversion from 'uint8_t *' (aka 'unsigned char *') to 'base::span<const uint8_t>' (aka 'span<const unsigned char>')

## Category
Rewriter needs to generate code to construct a span from the return value of a third_party function.

## Reason
The rewriter replaced `const uint8_t* original =` with `base::span<const uint8_t> original =`. The return value of `expected_frame_->GetFrameDataAtPos(i.rect().top_left())` is `uint8_t*`.  However, the compiler cannot find a suitable conversion to construct a `base::span<const uint8_t>` from a `uint8_t*`. This is because the size information is not available for the pointer returned by the third_party function `GetFrameDataAtPos`.

## Solution
The rewriter needs to generate the appropriate code to create the `base::span`. Since the size is not available, it needs to be figured out. The rewriter needs to create a span from the return value, the size is based on the dimensions of the region of the frame.

The code snippet `i.rect().top_left()` is the top-left coordinate of a rectangle, and the dimensions of the rectangle are `i.rect().width()` and `i.rect().height()`. The number of bytes in each row is `kBytesPerPixel * i.rect().width()`, and the number of rows is `i.rect().height()`.  Therefore, the total number of bytes in the region is `kBytesPerPixel * i.rect().width() * i.rect().height()`.

The rewriter should generate:

```c++
base::span<const uint8_t> original(
    expected_frame_->GetFrameDataAtPos(i.rect().top_left()),
    kBytesPerPixel * i.rect().width() * i.rect().height());
```

## Note
The second error message is related to `Rewriter needs to cast argument to base::span::subspan() to an unsigned value.`.