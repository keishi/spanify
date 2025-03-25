# Build Failure Analysis: 2025_03_19_patch_977

## First error

../../content/browser/media/capture/desktop_capture_device.cc:668:27: error: no viable conversion from 'webrtc::DesktopFrame' to 'base::span<uint8_t>' (aka 'span<unsigned char>')
  668 |       base::span<uint8_t> output_data_base = *output_frame_;
      |                           ^                  ~~~~~~~~~~~~~~

## Category
Rewriter needs to generate code to construct a span from the return value of a third_party function.

## Reason
The rewriter incorrectly replaced `uint8_t* output_data_base = output_frame_->data();` with `base::span<uint8_t> output_data_base = *output_frame_;`. However `output_frame_` is a pointer to a `webrtc::DesktopFrame`, which cannot be implicitly converted to a `base::span`. The rewriter should have added `.data()` to the right-hand side, similar to how it usually works for `SkBitmap::getAddr32`. Additionally, the span should only be created if `output_frame_` is not null.

## Solution
The rewriter needs to recognize this pattern and generate `base::span` construction from `output_frame_->data()` and add null check.
```c++
base::span<uint8_t> output_data_base = output_frame_? base::span(output_frame_->data(), output_frame_->size()): base::span<uint8_t>();
```

## Note
The subsequent errors are a result of `output_data_base` being a span instead of a pointer.
```
../../content/browser/media/capture/desktop_capture_device.cc:673:59: error: invalid operands to binary expression ('base::span<uint8_t>' (aka 'span<unsigned char>') and 'const int')
  673 |       uint8_t* output_y = UNSAFE_BUFFERS(output_data_base + offset_y);
      |                                          ~~~~~~~~~~~~~~~~ ^ ~~~~~~~~