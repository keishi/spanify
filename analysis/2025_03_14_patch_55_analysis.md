# Build Failure Analysis: 2025_03_14_patch_55

## First error

../../remoting/codec/codec_test.cc:113:33: error: no viable conversion from 'uint8_t *' (aka 'unsigned char *') to 'base::span<const uint8_t>' (aka 'span<const unsigned char>')

## Category
Rewriter needs to avoid spanifying functions if it requires spanifying excluded code.

## Reason
The rewriter spanified `VideoDecoderTester::DecodeAndCheckFrame` but because `webrtc::DesktopFrame::GetFrameDataAtPos` is third_party code that isn't spanified, the compiler is complaining that there is no conversion from `uint8_t*` to `base::span<const uint8_t>`. We shouldn't spanify functions that require spanifying excluded code.

## Solution
The rewriter should avoid spanifying `VideoDecoderTester::DecodeAndCheckFrame`.

## Note
There was a second error found:
```
../../base/numerics/safe_conversions.h:271:47: error: no matching function for call to 'strict_cast'
  271 |   constexpr StrictNumeric(Src value) : value_(strict_cast<T>(value)) {}

../../remoting/codec/codec_test.cc:120:37: note: in instantiation of function template specialization 'base::internal::StrictNumeric<unsigned long>::StrictNumeric<int>' requested here
  120 |         original = original.subspan(expected_frame_->stride());
```

This is the "Rewriter needs to cast argument to base::span::subspan() to an unsigned value." error, but it is a secondary error.