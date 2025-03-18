# Build Failure Analysis: 2025_03_14_patch_57

## First error

../../remoting/codec/codec_test.cc:137:33: error: no viable conversion from 'uint8_t *' (aka 'unsigned char *') to 'base::span<const uint8_t>' (aka 'span<const unsigned char>')

## Category
Rewriter needs to generate code to construct a span from the return value of a third_party function.

## Reason
`frame_->GetFrameDataAtPos` returns a raw pointer. The rewriter introduced a `base::span` variable and attempted an implicit construction from the raw pointer. This requires an explicit construction of the span: `base::span(ptr, size)`.

## Solution
The rewriter should generate the code to explicitly construct the `base::span`. The size is unknown in this case and should be a placeholder for the developer to fill out.

```diff
--- a/remoting/codec/codec_test.cc
+++ b/remoting/codec/codec_test.cc
@@ -134,8 +134,8 @@
          i.Advance()) {
       const uint8_t* expected =
           expected_frame_->GetFrameDataAtPos(i.rect().top_left());
-      base::span<const uint8_t> actual =
-          frame_->GetFrameDataAtPos(i.rect().top_left());
+      base::span<const uint8_t> actual(
+          frame_->GetFrameDataAtPos(i.rect().top_left()), <# size #>);
       for (int y = 0; y < i.rect().height(); ++y) {

```

## Note
1. The rewriter needs to cast argument to base::span::subspan() to an unsigned value.
```
../../base/numerics/safe_conversions.h:271:47: error: no matching function for call to 'strict_cast'
  271 |   constexpr StrictNumeric(Src value) : value_(strict_cast<T>(value)) {}
      |                                               ^~~~~~~~~~~~~~
../../remoting/codec/codec_test.cc:142:56: note: in instantiation of function template specialization 'base::internal::StrictNumeric<unsigned long>::StrictNumeric<int>' requested here
  142 |                                         actual.subspan(x * kBytesPerPixel));
      |                                                        ^
```

2. Code is attempting to increment a `base::span` variable. The rewriter should generate the appropriate code to modify the span.
```
../../remoting/codec/codec_test.cc:163:50: error: cannot increment value of type 'base::span<const uint8_t>' (aka 'span<const unsigned char>')
  163 |                      static_cast<double>((decoded++)[0]);
      |                                           ~~~~~~~^
../../remoting/codec/codec_test.cc:168:12: error: cannot increment value of type 'base::span<const uint8_t>' (aka 'span<const unsigned char>')
  168 |     decoded++;
      |     ~~~~~~~^