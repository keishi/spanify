# Build Failure Analysis: 2025_05_02_patch_1696

## First error

../../media/capture/video/fake_video_capture_device.cc:902:51: error: no viable conversion from 'value_type *' (aka 'unsigned char *') to 'base::span<uint8_t>' (aka 'span<unsigned char>')
  902 |   frame_painter()->PaintFrame(timestamp_to_paint, &sk_n32_buffer_[0]);
      |                                                   ^~~~~~~~~~~~~~~~~~

## Category
Rewriter failing to recognize raw pointer passed to spanified function.

## Reason
The function `PacmanFramePainter::PaintFrame` has been modified to accept a `base::span<uint8_t>` as its `target_buffer` argument. However, at the call site within `FakePhotoDevice::TakePhoto`, the code is passing `&sk_n32_buffer_[0]`, which is a raw `uint8_t*`. The rewriter failed to recognize that the spanified function expects `base::span<uint8_t>` and it must be constructed from the buffer.

## Solution
The rewriter needs to be able to construct a `base::span` at the call site when a raw pointer is passed to a spanified function. Here the code should be changed to construct base::span. Since buffer has size, the rewritten code would look like this:
```
sk_n32_painter_->PaintFrame(elapsed_time, base::span(buffer.data(), buffer.size()));
```

## Note
The rewriter also modified another function with span argument `GpuMemoryBufferFrameDeliverer::PaintAndDeliverNextFrame`. However it used base::span as the argument type, so there weren't build errors.