# Build Failure Analysis: 2025_03_19_patch_447

## First error

../../base/numerics/safe_conversions.h:271:47: error: no matching function for call to 'strict_cast'
  271 |   constexpr StrictNumeric(Src value) : value_(strict_cast<T>(value)) {}
      |                                               ^~~~~~~~~~~~~~

## Category
Rewriter needs to cast argument to base::span::subspan() to an unsigned value.

## Reason
The `VideoFrame::PlaneSize` function returns an `int`, but the `subspan` function requires an unsigned type (`size_t`). The compiler is unable to implicitly cast the signed `int` to an unsigned type because it is a narrowing conversion.

## Solution
The rewriter needs to explicitly cast the `int` return value of `VideoFrame::PlaneSize` to `size_t` before passing it to the `subspan` function.

```c++
base::span<uint8_t> i420_u =
    i420_y.subspan(static_cast<size_t>(VideoFrame::PlaneSize(VideoPixelFormat::PIXEL_FORMAT_I420,
                                         VideoFrame::Plane::kY, dimensions)
                         .GetArea()));
```

## Note
The other error is similar and would be resolved by the same fix.