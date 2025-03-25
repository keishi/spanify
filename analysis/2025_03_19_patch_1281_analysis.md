# Build Failure Analysis: 2025_03_19_patch_1281

## First error

../../media/capture/video/linux/v4l2_capture_delegate.cc:1036:19: error: no matching conversion for functional-style cast from 'pollfd *' to 'base::span<pollfd, 1>'

## Category
Rewriter failing to recognize raw pointer passed to spanified function.

## Reason
The rewriter spanified the `poll` function but failed to spanify the callsite in `V4L2CaptureDelegate::DoCapture()`. The code is trying to pass `&device_pfd` to a `base::span<pollfd>`, but `&device_pfd` is a raw pointer to a single `pollfd` object, not an array.  A span expects a contiguous range, not a single object passed by address. This seems to be a bug with the rewriter where it failed to recognize a size info unavailable rhs value.

## Solution
The rewriter should correctly handle the case where a pointer to a single object is being passed to a function expecting a span. The easiest solution is to create a temporary `base::span` directly in the call. This works by changing `&device_pfd` to something like `base::make_span(&device_pfd, 1)`.

## Note
The rewriter should also verify that `nfds` parameter is equal to 1, in which case the code is sound.