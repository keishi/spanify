# Build Failure Analysis: 2025_03_19_patch_442

## First error

../../remoting/codec/codec_test.cc:115:33: error: no viable conversion from 'uint8_t *' (aka 'unsigned char *') to 'base::span<const uint8_t>' (aka 'span<const unsigned char>')

## Category
Rewriter needs to generate code to construct a span from the return value of a third_party function.

## Reason
The code is calling `frame_->GetFrameDataAtPos`, which returns a raw pointer (`uint8_t*`). However, the rewriter converted `decoded` to a `base::span<const uint8_t>`.  The rewriter must generate code to create a span from the raw pointer returned by the function call.

## Solution
The rewriter needs to create a span when assigning the return value of `frame_->GetFrameDataAtPos` to `decoded`. Since the size is unknown, the span must be constructed using only the data pointer, creating a span representing the range from that pointer to the end of the allocation.

```diff
--- a/remoting/codec/codec_test.cc
+++ b/remoting/codec/codec_test.cc
@@ -110,8 +112,8 @@ class VideoDecoderTester {
          i.Advance()) {
       const uint8_t* original =
           expected_frame_->GetFrameDataAtPos(i.rect().top_left());
-      base::span<const uint8_t> decoded =
-          frame_->GetFrameDataAtPos(i.rect().top_left());
+      const uint8_t* decoded_ptr = frame_->GetFrameDataAtPos(i.rect().top_left());
+      base::span<const uint8_t> decoded = base::span(decoded_ptr, frame_->stride() * frame_->height());
       const int row_size = kBytesPerPixel * i.rect().width();
       for (int y = 0; y < i.rect().height(); ++y) {
         EXPECT_EQ(0, memcmp(original, decoded.data(), row_size))

```

## Note
The second error is a follow up error of the first one because the rewriter didn't handle the return value of `GetFrameDataAtPos()` correctly.

```
../../base/numerics/safe_conversions.h:271:47: error: no matching function for call to 'strict_cast'
  271 |   constexpr StrictNumeric(Src value) : value_(strict_cast<T>(value)) {}
      |                                               ^~~~~~~~~~~~~~
../../remoting/codec/codec_test.cc:122:35: note: in instantiation of function template specialization 'base::internal::StrictNumeric<unsigned long>::StrictNumeric<int>' requested here
  122 |         decoded = decoded.subspan(frame_->stride());
      |                                   ^