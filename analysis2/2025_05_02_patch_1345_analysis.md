# Build Failure Analysis: 2025_05_02_patch_1345

## First error

../../media/gpu/vaapi/test/fake_libva_driver/fake_drv_video.cc:920:31: error: assigning to 'VAStatus (*)(VADriverContextP, VASurfaceID *, int)' (aka 'int (*)(VADriverContext *, unsigned int *, int)') from incompatible type 'VAStatus (VADriverContextP, base::span<VASurfaceID>, int)' (aka 'int (VADriverContext *, span<unsigned int>, int)'): type mismatch at 2nd parameter ('VASurfaceID *' (aka 'unsigned int *') vs 'base::span<VASurfaceID>' (aka 'span<unsigned int>'))

## Category
Pointer passed into spanified function parameter.

## Reason
The rewriter spanified the `FakeDestroySurfaces` function, but the function pointer assignment `vtable->vaDestroySurfaces = FakeDestroySurfaces;` is still expecting a `VASurfaceID*`.  The function signature in the vtable is not compatible with the spanified function signature. This happened because the rewriter didn't spanify the function in the vtable.

## Solution
The rewriter needs to identify function pointer assignments where the assigned function has been spanified, and update the function pointer type as well to match the new signature. The vtable definition needs to be updated with span.
```c++
//Old
VAStatus (*vaDestroySurfaces)(VADriverContextP ctx,
                             VASurfaceID* surface_list,
                             int num_surfaces);
//New
VAStatus (*vaDestroySurfaces)(VADriverContextP ctx,
                             base::span<VASurfaceID> surface_list,
                             int num_surfaces);
```

## Note
None