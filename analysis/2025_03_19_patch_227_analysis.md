# Build Failure Analysis: 2025_03_19_patch_227

## First error

../../base/numerics/safe_conversions.h:271:47: error: no matching function for call to 'strict_cast'

## Category
Rewriter needs to cast argument to base::span::subspan() to an unsigned value.

## Reason
The rewriter spanified the `dst_pixels` argument in `CopyPixelsToBuffer`, which is now a `base::span<uint8_t>`. The `dst_stride` variable is an `int`. When calling `.subspan(dst_stride)`, the rewriter needs to cast the `int` value `dst_stride` to `size_t` because `base::span::subspan` expects an unsigned value. The error message "no matching function for call to 'strict_cast'" suggests that the rewriter is not generating the necessary cast.

## Solution
The rewriter needs to insert a `static_cast<size_t>` when passing the `int` value `dst_stride` to the `subspan` function.

```c++
dst_pixels = dst_pixels.subspan(static_cast<size_t>(dst_stride));
```

## Note
The second error is a direct consequence of spanifying the function `CopyPixelsToBuffer` but not updating the call site. The code needs to pass `frame->data()` and the rewriter failed to do that automatically.
```c++
-  CopyPixelsToBuffer(bitmap, frame->data(), frame->stride());
+  CopyPixelsToBuffer(bitmap, *frame, frame->stride());
```

Pointer passed into spanified function parameter.