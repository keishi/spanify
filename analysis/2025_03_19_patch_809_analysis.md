# Build Failure Analysis: 2025_03_19_patch_809

## First error
../../remoting/codec/webrtc_video_encoder_vpx.cc:492:29: error: no viable conversion from 'const webrtc::DesktopFrame' to 'base::span<const uint8_t>' (aka 'span<const unsigned char>')

## Category
Rewriter failing to recognize raw pointer passed to spanified function.

## Reason
The rewriter is failing to recognize that `*frame` is being passed as an argument where a `base::span<const uint8_t>` is expected. The rewriter does not know how to convert a `webrtc::DesktopFrame` to a span. The rewriter should be able to detect this case and properly create the span.

## Solution
The rewriter needs to be able to rewrite the following type of code, where a raw pointer is passed to a function which is now taking a span:

```c++
   base::span<const uint8_t> rgb_data = *frame;
```

## Note
There are more errors that happened because of the first error:
```
../../base/numerics/safe_conversions.h:271:47: error: no matching function for call to 'strict_cast'
```
This is caused by subspan taking an int as an argument where it expects unsigned. This can be fixed by Rewriter needs to cast argument to base::span::subspan() to an unsigned value.