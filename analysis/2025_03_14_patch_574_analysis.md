# Build Failure Analysis: 2025_03_14_patch_574

## First error

../../chrome/browser/support_tool/screenshot_data_collector.cc:105:29: error: no viable conversion from 'webrtc::DesktopFrame' to 'base::span<const uint8_t>' (aka 'span<const unsigned char>')

## Category
Rewriter needs to generate code to construct a span from the return value of a third_party function.

## Reason
`webrtc::DesktopFrame` cannot be implicitly converted to `base::span<const uint8_t>`. The rewriter spanified `frame` as `base::span<const uint8_t> frame_buffer = *frame;`. However, `frame` is of type `webrtc::DesktopFrame*` and `*frame` is of type `webrtc::DesktopFrame`, hence there is a type mismatch.

## Solution
A raw pointer return value from a third_party function (e.g. `SkBitmap::getAddr32`, `webrtc::DesktopFrame::GetFrameDataAtPos`) is assigned to a converted span. Rewriter needs to construct a span from the return value, but the size is hard to identify.

```c++
// before
base::span<const uint8_t> frame_buffer = *frame;

// after
const uint8_t* frame_buffer_data = frame->data();
base::span<const uint8_t> frame_buffer(frame_buffer_data, frame->size().width() * frame->size().height());
```

## Note
```
../../base/numerics/safe_conversions.h:271:47: error: no matching function for call to 'strict_cast'
  271 |   constexpr StrictNumeric(Src value) : value_(strict_cast<T>(value)) {}
      |                                               ^~~~~~~~~~~~~~
../../chrome/browser/support_tool/screenshot_data_collector.cc:117:41: note: in instantiation of function template specialization 'base::internal::StrictNumeric<unsigned long>::StrictNumeric<int>' requested here
  117 |     frame_buffer = frame_buffer.subspan(frame->stride());
      |                                         ^
```
This is a separate issue. The return type of `frame->stride()` needs to be cast to `size_t` before it is passed to subspan. The rewriter should handle this.
```c++
// before
frame_buffer = frame_buffer.subspan(frame->stride());

// after
frame_buffer = frame_buffer.subspan(static_cast<size_t>(frame->stride()));