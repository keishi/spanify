# Build Failure Analysis: 2025_03_19_patch_637

## First error

../../gpu/command_buffer/service/copy_shared_image_helper.cc:413:48: error: no viable conversion from 'std::array<SkSurface *, SkYUVAInfo::kMaxPlanes>' to 'SkSurface **'

## Category
Rewriter needs to recognize raw pointer passed to spanified function.

## Reason
The code expects a `SkSurface**`, but the rewriter replaced `SkSurface* yuva_sk_surfaces[SkYUVAInfo::kMaxPlanes]` with `std::array<SkSurface*, SkYUVAInfo::kMaxPlanes> yuva_sk_surfaces`. There's no automatic conversion from `std::array` to a raw pointer.

## Solution
The rewriter should be able to detect when spanifying/arrayifying a function requires changes to the call site. In such cases, it needs to either also spanify the call site or insert a `.data()` conversion.

## Note
The correct fix in this case would likely be to use `.data()` to convert the array to a pointer:

```c++
-      SkSurface* yuva_sk_surfaces[SkYUVAInfo::kMaxPlanes] = {};
+      std::array<SkSurface*, SkYUVAInfo::kMaxPlanes> yuva_sk_surfaces = {};
       for (int plane_index = 0; plane_index < dest_format.NumberOfPlanes();
            plane_index++) {
         // Get surface per plane from destination scoped write access.
```

```c++
       skia::BlitRGBAToYUVA(source_image.get(), yuva_sk_surfaces, yuva_info);
```

becomes

```c++
       skia::BlitRGBAToYUVA(source_image.get(), yuva_sk_surfaces.data(), yuva_info);