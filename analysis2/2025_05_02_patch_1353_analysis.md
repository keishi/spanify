# Build Failure: 2025_05_02_patch_1353

## First error

```
../../base/numerics/safe_conversions.h:271:47: error: no matching function for call to 'strict_cast'
  271 |   constexpr StrictNumeric(Src value) : value_(strict_cast<T>(value)) {}
      |                                               ^~~~~~~~~~~~~~
```

## Category
Rewriter needs to cast argument to base::span::subspan() to an unsigned value.

## Reason
The `subspan()` method requires an unsigned integer for its arguments. The code is passing the return value of `VideoFrame::PlaneSize`, which is a signed integer. The `strict_cast` is failing because it detects a potential loss of information when casting from a signed int to an unsigned long.

## Solution
The rewriter needs to insert a `base::checked_cast<size_t>()` around the argument to `subspan()` to convert the signed integer to an unsigned `size_t`.

```c++
base::span<uint8_t> i420_u =
      i420_y.subspan(base::checked_cast<size_t>(VideoFrame::PlaneSize(VideoPixelFormat::PIXEL_FORMAT_I420,
                                           VideoFrame::Plane::kY, dimensions)
                         .GetArea()));
```
```c++
EmitReplacement(key, GetIncludeDirective(range, source_manager,
                                           "base/numerics/safe_conversions.h"));
EmitReplacement(key, GetIncludeDirective(range, source_manager, "cstdint",
                                           /*is_system_include_path=*/true));
```

## Note
The second error is a consequence of the first. After fixing the first error, it might be necessary to apply the same fix to the second `subspan()` call as well.
```c++
base::span<uint8_t> i420_u =
      i420_y.subspan(base::checked_cast<size_t>(VideoFrame::PlaneSize(VideoPixelFormat::PIXEL_FORMAT_I420,
                                           VideoFrame::Plane::kY, dimensions)
                         .GetArea()));
uint8_t* i420_v =
      i420_u
          .subspan(base::checked_cast<size_t>(VideoFrame::PlaneSize(VideoPixelFormat::PIXEL_FORMAT_I420,
                                         VideoFrame::Plane::kU, dimensions)
                       .GetArea()))
          .data();