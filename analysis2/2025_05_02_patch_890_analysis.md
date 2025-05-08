# Build Failure Analysis: 2025_05_02_patch_890

## First error

../../base/numerics/safe_conversions.h:271:47: error: no matching function for call to 'strict_cast'

## Category
Rewriter needs to cast argument to base::span::subspan() to an unsigned value.

## Reason
The `subspan` method requires an unsigned integer as argument. However the `rowBytesAsPixels()` method returns an int.

```c++
117 |     bitmap_buffer = bitmap_buffer.subspan(bitmap.rowBytesAsPixels());
      |                                           ^
```

The error occurs because the `subspan()` function expects an unsigned integer, but `bitmap.rowBytesAsPixels()` returns a signed integer. The `strict_cast` in `safe_conversions.h` is used to ensure that the conversion is safe, but there is no matching function because the constraint is not satisfied.

## Solution
The rewriter should cast the argument of `subspan()` to `size_t` so it is unsigned.

```c++
bitmap_buffer = bitmap_buffer.subspan(static_cast<size_t>(bitmap.rowBytesAsPixels()));
```

## Note
None