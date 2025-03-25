# Build Failure Analysis: 2025_03_19_patch_123

## First error

../../remoting/host/mouse_shape_pump.cc:93:27: error: no viable conversion from 'const DesktopFrame' to 'base::span<uint8_t>' (aka 'span<unsigned char>')

## Category
Rewriter needs to generate code to construct a span from the return value of a third_party function.

## Reason
The code attempts to assign `*cursor->image()` (which is a `webrtc::DesktopFrame`) directly to a `base::span<uint8_t> current_row`. The compiler cannot find a viable conversion because the `webrtc::DesktopFrame` is not implicitly convertible to `base::span<uint8_t>`. The rewriter is expected to generate code to construct a span from the return value of a third_party function. The generated span would wrap the data buffer in the returned `webrtc::DesktopFrame`.

## Solution
The rewriter needs to generate code to properly construct `base::span<uint8_t>` from `webrtc::DesktopFrame`. This can be done by using the `data()` and `size()` method exposed by `DesktopFrame`.

```c++
//  Before
base::span<uint8_t> current_row = *cursor->image();

//  After
base::span<uint8_t> current_row(cursor->image()->data(), cursor->image()->size().width() * webrtc::DesktopFrame::kBytesPerPixel);
```

## Note

The other errors are consequences of this first error. 

1.  The error "unexpected namespace name 'webrtc': expected expression" occurs because the code tries to use the namespace `webrtc` where an expression is expected.
2.  The error "no matching function for call to 'strict_cast'" occurs because of incorrect type conversions, because it is calling methods on current_row as if it was the webrtc object.
3. There are conflicting replacements, which are not analyzed, but also need to be addressed after fixing the first error.