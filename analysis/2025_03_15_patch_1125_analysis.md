# Build Failure Analysis: 2025_03_15_patch_1125

## First error

../../remoting/codec/video_encoder_vpx.cc:441:29: error: no viable conversion from 'const webrtc::DesktopFrame' to 'base::span<const uint8_t>' (aka 'span<const unsigned char>')
  441 |   base::span<const uint8_t> rgb_data = frame;
      |                             ^          ~~~~~

## Category
Rewriter needs to generate code to construct a span from the return value of a third_party function.

## Reason
The code is attempting to assign a `webrtc::DesktopFrame` directly to a `base::span<const uint8_t>`. The `webrtc::DesktopFrame` class is a third-party type and cannot be directly converted to `base::span`. The rewriter did not add the necessary `.data()` call to convert the `DesktopFrame` object to raw pointer, which can then be implicitly converted to span. The note `const webrtc::DesktopFrame &' does not satisfy 'contiguous_range'` in the error message confirms this.

## Solution
The rewriter needs to construct a `base::span` from the return value of the `frame` variable. Since the size of the `base::span` is not clear, add `frame.data(), frame.size()` when assigning to span.

```c++
-  base::span<const uint8_t> rgb_data = frame.data();
+  base::span<const uint8_t> rgb_data = base::span(frame.data(), frame.size());
```

## Note
The other errors in the log are due to missing .data() after span was subspanified and are dependent errors to fix after solving this bug.