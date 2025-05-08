# Build Failure Analysis: 2025_05_02_patch_1797

## First error

../../content/browser/media/capture/desktop_capture_device.cc:668:27: error: no viable conversion from 'webrtc::DesktopFrame' to 'base::span<uint8_t>' (aka 'span<unsigned char>')
  668 |       base::span<uint8_t> output_data_base = *output_frame_;
      |                           ^                  ~~~~~~~~~~~~~~

## Category
Rewriter does not handle assignment of spanified variable from an allocation using new.

## Reason
The code is trying to assign a `webrtc::DesktopFrame` to a `base::span<uint8_t>`. Looking at the original code, `output_frame_` is a pointer. The rewriter is replacing `uint8_t* output_data_base = output_frame_->data();` with `base::span<uint8_t> output_data_base = *output_frame_;`. The `webrtc::DesktopFrame` is allocated with `new`, so the rewriter should not be rewriting the code.

## Solution
The rewriter needs to avoid rewriting assignments from raw pointer like this. When a raw pointer is created with `new`, it should be an owned object like unique_ptr.

## Note
There are other errors as well:

```
../../content/browser/media/capture/desktop_capture_device.cc:673:59: error: invalid operands to binary expression ('base::span<uint8_t>' (aka 'span<unsigned char>') and 'const int')
  673 |       uint8_t* output_y = UNSAFE_BUFFERS(output_data_base + offset_y);

../../content/browser/media/capture/desktop_capture_device.cc:675:43: error: invalid operands to binary expression ('base::span<uint8_t>' (aka 'span<unsigned char>') and 'const int')
  675 |           UNSAFE_BUFFERS(output_data_base + output_plane_size_y + offset_uv);

../../content/browser/media/capture/desktop_capture_device.cc:677:43: error: invalid operands to binary expression ('base::span<uint8_t>' (aka 'span<unsigned char>') and 'const int')
  677 |           UNSAFE_BUFFERS(output_data_base + output_plane_size_y +