# Build Failure Analysis: 2025_05_02_patch_1600

## First error

../../remoting/codec/webrtc_video_encoder_av1.cc:279:29: error: no viable conversion from 'const webrtc::DesktopFrame' to 'base::span<const uint8_t>' (aka 'span<const unsigned char>')

## Category
Rewriter needs to generate code to construct a span from the return value of a third_party function.

## Reason
The rewriter is trying to convert `*frame` (which is of type `webrtc::DesktopFrame`) to a `base::span<const uint8_t>`. However, there is no implicit conversion between `webrtc::DesktopFrame` and `base::span<const uint8_t>`. The rewriter needs to generate code to construct a span from the return value, but the size is hard to identify.

## Solution
The rewriter needs to generate code to construct a span from the `webrtc::DesktopFrame` object.

Replace `base::span<const uint8_t> rgb_data = *frame;` with `base::span<const uint8_t> rgb_data = base::span<const uint8_t>(frame->data(), frame->size());`.

## Note
The secondary error is:
../../base/numerics/safe_conversions.h:271:47: error: no matching function for call to 'strict_cast'

This is because `rgb_offset` which is of type `int` is being implicitly converted to `size_t`. Rewriter needs to cast argument to base::span::subspan() to an unsigned value.