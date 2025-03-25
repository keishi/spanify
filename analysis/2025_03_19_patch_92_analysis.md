# Build Failure Analysis: 2025_03_19_patch_92

## First error

../../base/numerics/safe_conversions.h:271:47: error: no matching function for call to 'strict_cast'
  271 |   constexpr StrictNumeric(Src value) : value_(strict_cast<T>(value)) {}
      |                                               ^~~~~~~~~~~~~~

## Category
Rewriter needs to cast argument to base::span::subspan() to an unsigned value.

## Reason
The `subspan` method takes a `size_t` as argument, which is an unsigned type. However, `frame_offset_a` and `frame_offset_b` are of type `int`.  The `strict_cast` function in `StrictNumeric` doesn't have an implicit conversion from `int` to `size_t` which is defined as `unsigned long` in this case, hence the compile error. The rewriter needs to insert a cast to `size_t` or `unsigned long` to fix this.

## Solution
The rewriter needs to insert a cast to `size_t` or `unsigned long` for the arguments to `subspan`. For example, the code:

```c++
base::span<const float> a_src = a->channel(ch).subspan(frame_offset_a);
```

should be rewritten as:

```c++
base::span<const float> a_src = a->channel(ch).subspan(static_cast<size_t>(frame_offset_a));
```

## Note
The other errors in the build log are related to the incorrect usage of the increment operator on `base::span`, which doesn't support operator++. The correct way to advance within a span is to use array indexing or pointer arithmetic and subspan().