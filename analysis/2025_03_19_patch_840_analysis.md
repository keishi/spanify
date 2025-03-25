# Build Failure Analysis: 2025_03_19_patch_840

## First error

../../remoting/codec/video_encoder_vpx.cc:441:29: error: no viable conversion from 'const webrtc::DesktopFrame' to 'base::span<const uint8_t>' (aka 'span<const unsigned char>')

## Category
Rewriter needs to generate code to construct a span from the return value of a third_party function.

## Reason
The rewriter is attempting to implicitly convert a `const webrtc::DesktopFrame` to `base::span<const uint8_t>`. However, `webrtc::DesktopFrame` is a third_party type and doesn't provide the necessary implicit conversion operators or other mechanisms required by `base::span`'s constructor.

The rewriter is treating `frame` as a `uint8_t*` buffer. However, `frame` is an object. Thus the return type `frame.data()` should be wrapped by a span.

## Solution
The rewriter needs to construct a span from the `webrtc::DesktopFrame` object. We can assume the entire frame is used because there is no other size specified.

```diff
-  const uint8_t* rgb_data = frame.data();
+  base::span<const uint8_t> rgb_data(frame.data(), frame.size());
```

## Note
The second error is that the rewriter failed to cast argument to base::span::subspan() to an unsigned value, which should also be addressed.