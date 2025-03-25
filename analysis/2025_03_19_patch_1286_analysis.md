# Build Failure Analysis: 2025_03_19_patch_1286

## First error

../../base/numerics/safe_conversions.h:271:47: error: no matching function for call to 'strict_cast'

## Category
Rewriter needs to cast argument to base::span::subspan() to an unsigned value.

## Reason
The `subspan()` method requires an unsigned integer as an argument. `VideoFrame::PlaneSize().GetArea()` returns a signed integer, and the rewriter does not generate the cast to `size_t`, causing a build error due to the lack of a matching `strict_cast`.

## Solution
Modify the rewriter to insert a cast to `size_t` when calling `subspan()` with a signed integer argument.

Example:
```c++
base::span<uint8_t> scale_up = scale_yp.subspan(
    static_cast<size_t>(VideoFrame::PlaneSize(PIXEL_FORMAT_I420, 0, scale_size).GetArea()));
```

## Note
None