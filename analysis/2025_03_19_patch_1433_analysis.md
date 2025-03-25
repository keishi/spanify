# Build Failure Analysis: 2025_03_19_patch_1433

## First error

../../media/capture/video/fake_video_capture_device.cc:912:51: error: no viable conversion from 'value_type *' (aka 'unsigned char *') to 'base::span<uint8_t>' (aka 'span<unsigned char>')

## Category
Rewriter failing to recognize raw pointer passed to spanified function.

## Reason
The rewriter spanified the `PaintFrame` function in `PacmanFramePainter`, but it is failing to properly convert the arguments to that function at call sites. Specifically, at the call site in `FakePhotoDevice::TakePhoto`, it is passing `buffer.data()` which returns a raw pointer and the rewriter is failing to convert it to a span, since there is no size information available to construct the span. This is a bug with the rewriter where it failed to recognize a size info unavailable rhs value.

## Solution
The rewriter needs to be able to handle cases where the size information is not available when converting to span. In these cases, it needs to create a span from the raw pointer using the proper size.

## Note
The same error is occurring in other files. The root cause is the same across these files, so it can be handled by fixing the same issue in the rewriter.