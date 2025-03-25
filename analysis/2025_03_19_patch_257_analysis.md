# Build Failure Analysis: 2025_03_19_patch_257

## First error
../../ui/gfx/skia_color_space_util.cc:102:10: error: no matching function for call to 'SkM44FromRowMajor3x3'

## Category
Rewriter failing to recognize raw pointer passed to spanified function.

## Reason
The function `SkM44FromRowMajor3x3` was spanified, but the call site `SkM44FromRowMajor3x3(&in.vals[0][0])` is passing a raw pointer `&in.vals[0][0]` to it. The rewriter failed to recognize that the raw pointer `&in.vals[0][0]` has size information, since `in.vals` is a `skcms_Matrix3x3` type.

## Solution
The rewriter needs to be able to recognize the size of the raw pointer and pass that information to the `span` constructor.
In this particular case, the rewriter needs to generate `base::span` from `&in.vals[0][0]` with size `9`.
```c++
SkM44 COLOR_SPACE_EXPORT SkM44FromRowMajor3x3(base::span<const float> data) 
{
  DCHECK(!data.empty());
  // clang-format off
  return SkM44(data[0], data[1], data[2], 0,
               data[3], data[4], data[5], 0,
               data[6], data[7], data[8], 0,
               0,       0,       0,       1);
}
```

The code:
```c++
SkM44 COLOR_SPACE_EXPORT SkM44FromSkcmsMatrix3x3(const skcms_Matrix3x3& in) {
  return SkM44FromRowMajor3x3(&in.vals[0][0]);
}
```

Should be rewritten to:
```c++
SkM44 COLOR_SPACE_EXPORT SkM44FromSkcmsMatrix3x3(const skcms_Matrix3x3& in) {
  return SkM44FromRowMajor3x3(base::span(&in.vals[0][0], 9));
}
```

## Note
None