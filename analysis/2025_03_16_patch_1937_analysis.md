```
# Build Failure Analysis: 157

## First error

../../base/numerics/safe_conversions.h:271:47: error: no matching function for call to 'strict_cast'

## Category
Rewriter needs to cast argument to base::span::subspan() to an unsigned value.

## Reason
`StrictNumeric` constructor calls `strict_cast` which requires that the source type and destination type must have some constraints. In this case the source type is int, while the destination type is size_t(unsigned long). Since int can be negative, the constraint `kStaticDstRangeRelationToSrcRange<Dst, SrcType> == NumericRangeRepresentation::kContained` is not satisfied. 

The generated code is
```c++
  base::span<uint8_t> crop_up = crop_yp.subspan(
      VideoFrame::PlaneSize(PIXEL_FORMAT_I420, 0, crop_size).GetArea());
```

`VideoFrame::PlaneSize` returns an `int`.

## Solution
Cast the return value of `VideoFrame::PlaneSize().GetArea()` to `size_t` or `unsigned int` before passing it to subspan().

```c++
  base::span<uint8_t> crop_up = crop_yp.subspan(
      static_cast<size_t>(VideoFrame::PlaneSize(PIXEL_FORMAT_I420, 0, crop_size).GetArea()));
```

## Note
No additional notes.