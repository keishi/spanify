# Build Failure Analysis: 2025_03_19_patch_1216

## First error

../../base/numerics/safe_conversions.h:271:47: error: no matching function for call to 'strict_cast'

## Category
Rewriter needs to cast argument to base::span::subspan() to an unsigned value.

## Reason
The `base::span::subspan()` function requires an unsigned value as input. The code passes `VideoFrame::PlaneSize(PIXEL_FORMAT_I420, 0, crop_size).GetArea()` whose return value is `int`. This causes a compile error because `strict_cast` fails.

## Solution
Cast `VideoFrame::PlaneSize(PIXEL_FORMAT_I420, 0, crop_size).GetArea()` to an unsigned value.
```
base::span<uint8_t> crop_up = crop_yp.subspan(
      static_cast<size_t>(VideoFrame::PlaneSize(PIXEL_FORMAT_I420, 0, crop_size).GetArea()));