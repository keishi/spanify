```
# Build Failure Analysis: 2025_03_19_patch_812

## First error

../../remoting/codec/webrtc_video_encoder_av1.cc:279:29: error: no viable conversion from 'const webrtc::DesktopFrame' to 'base::span<const uint8_t>' (aka 'span<const unsigned char>')

## Category
Rewriter needs to generate code to construct a span from the return value of a third_party function.

## Reason
The error occurs because the rewriter converted `const uint8_t* rgb_data = frame->data();` to `base::span<const uint8_t> rgb_data = *frame;`.  `frame` is a `webrtc::DesktopFrame*`, not a `uint8_t*`. `DesktopFrame` does not have a conversion operator to `base::span`. The rewriter should have instead rewritten the code to construct a span from the pointer returned by `frame->data()`. The rewriter failed to generate code to construct a span from the return value of a third_party function and was unable to determine the correct size.

## Solution
The rewriter should have generated an expression to create a span from the pointer returned by `frame->data()`. Since the size information is available with `frame->stride() * frame->height()`, it can be used to initialize the span.
The rewriter should generate following code:
```c++
base::span<const uint8_t> rgb_data(frame->data(), frame->stride() * frame->height());
```

## Note
The other error is:

```
../../base/numerics/safe_conversions.h:271:47: error: no matching function for call to 'strict_cast'
  271 |   constexpr StrictNumeric(Src value) : value_(strict_cast<T>(value)) {}
      |                                               ^~~~~~~~~~~~~~
../../remoting/codec/webrtc_video_encoder_av1.cc:297:45: note: in instantiation of function template specialization 'base::internal::StrictNumeric<unsigned long>::StrictNumeric<int>' requested here
  297 |         libyuv::ARGBToI420(rgb_data.subspan(rgb_offset).data(), rgb_stride,
      |                                             ^

```

This indicates that `rgb_offset` is an `int`, which is then implicitly converted to `unsigned long`. This is unsafe, so the rewriter needs to use a `strict_cast` to prevent this. The first error needs to be fixed first before this can be addressed.