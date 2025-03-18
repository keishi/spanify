# Build Failure Analysis: 2025_03_14_patch_125

## First error

../../remoting/codec/webrtc_video_encoder_av1.cc:279:29: error: no viable conversion from 'const webrtc::DesktopFrame' to 'base::span<const uint8_t>' (aka 'span<const unsigned char>')

## Category
Rewriter needs to spanify a pointer using `.data()` or `.get()` when the original variable is an object and not a pointer.

## Reason
The code attempted to convert `frame` (a `webrtc::DesktopFrame` object) to a `base::span`. However, the `base::span` constructor expects a pointer, not an object. In the original code, `rgb_data` was a `uint8_t*` obtained via `frame->data()`, so it was compatible. Need to spanify it properly.

## Solution
Modify the line to convert the webrtc::DesktopFrame object to a span by using `frame->data()` and the appropriate frame size from the member function calls of the `frame` object in the original code.

```c++
-  base::span<const uint8_t> rgb_data = *frame;
+  base::span<const uint8_t> rgb_data(frame->data(), frame->size());
```

## Note
The error message `no matching function for call to 'strict_cast'` suggests an integer conversion issue, likely when creating the `subspan`. This is a secondary error caused by the first problem.
```
../../base/numerics/safe_conversions.h:271:47: error: no matching function for call to 'strict_cast'