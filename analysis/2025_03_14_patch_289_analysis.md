# Build Failure Analysis: 2025_03_14_patch_289

## First error

../../content/browser/media/capture/desktop_capture_device.cc:623:40: error: invalid operands to binary expression ('base::span<uint8_t>' (aka 'span<unsigned char>') and 'const int')

## Category
Rewriter needs to add `.data()` when performing pointer arithmetic on a spanified variable.

## Reason
The code is attempting to perform pointer arithmetic on a span object.  The rewriter converted `temp_buffer_y` to `base::span<uint8_t>`, but did not update the line to use `temp_buffer_y.data()` in the pointer arithmetic.

## Solution
The rewriter should recognize pointer arithmetic operations on span objects and automatically insert `.data()` after the variable name.

## Note
The second error is similar:

```
../../content/browser/media/capture/desktop_capture_device.cc:681:31: error: invalid operands to binary expression ('base::span<uint8_t>' (aka 'span<unsigned char>') and 'int')
  681 |   libyuv::I420Scale(temp_buffer_y.data(), temp_stride_y, temp_buffer_u,
      |                     ^~~~~~~~~~~~~~~~~~~~