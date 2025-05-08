```
# Build Failure Analysis: 2025_05_02_patch_704

## First error

```
../../gpu/command_buffer/service/copy_shared_image_helper.cc:412:48: error: no viable conversion from 'std::array<SkSurface *, SkYUVAInfo::kMaxPlanes>' to 'SkSurface **'
  412 |       skia::BlitRGBAToYUVA(source_image.get(), yuva_sk_surfaces, yuva_info);
```

## Category
Rewriter failing to recognize raw pointer passed to spanified function.

## Reason
The code was rewritten to use `std::array<SkSurface*, SkYUVAInfo::kMaxPlanes>` for `yuva_sk_surfaces`. However, the `skia::BlitRGBAToYUVA` function expects a raw pointer `SkSurface**`. The rewriter failed to recognize that the `yuva_sk_surfaces` needs to be converted to `SkSurface**`. It seems to be a bug with the rewriter where it failed to recognize a size info unavailable rhs value.

## Solution
The rewriter should recognize this pattern and convert the `std::array` to a raw pointer when passing it to the `skia::BlitRGBAToYUVA` function. Use `.data()` to get raw pointer.

```c++
skia::BlitRGBAToYUVA(source_image.get(), yuva_sk_surfaces.data(), yuva_info);
```

## Note
None