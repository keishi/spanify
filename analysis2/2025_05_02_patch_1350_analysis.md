# Build Failure Analysis: 2025_05_02_patch_1350

## First error

../../media/gpu/vaapi/test/fake_libva_driver/fake_drv_video.cc:958:31: error: assigning to 'VAStatus (*)(VADriverContextP, unsigned int, unsigned int, unsigned int, VASurfaceID *, unsigned int, VASurfaceAttrib *, unsigned int)' (aka 'int (*)(VADriverContext *, unsigned int, unsigned int, unsigned int, unsigned int *, unsigned int, _VASurfaceAttrib *, unsigned int)') from incompatible type 'VAStatus (VADriverContextP, unsigned int, unsigned int, unsigned int, base::span<VASurfaceID>, unsigned int, VASurfaceAttrib *, unsigned int)' (aka 'int (VADriverContext *, unsigned int, unsigned int, unsigned int, span<unsigned int>, unsigned int, _VASurfaceAttrib *, unsigned int)'): type mismatch at 5th parameter ('VASurfaceID *' (aka 'unsigned int *') vs 'base::span<VASurfaceID>' (aka 'span<unsigned int>'))
  958 |   vtable->vaCreateSurfaces2 = FakeCreateSurfaces2;
      |                               ^~~~~~~~~~~~~~~~~~~

## Category
Pointer passed into spanified function parameter.

## Reason
The code attempts to assign the address of `FakeCreateSurfaces2` to a function pointer `vtable->vaCreateSurfaces2`. The function signature of `FakeCreateSurfaces2` was changed by the rewriter to use `base::span` for the `surfaces` argument, while the function pointer `vtable->vaCreateSurfaces2` still expects a raw pointer `VASurfaceID*`. This type mismatch causes the compilation error.

The rewriter spanified a function, but failed to spanify a call site.

## Solution
The rewriter needs to identify all call sites of spanified functions and update the function signatures accordingly, including function pointer types.
In this specific case, the rewriter should have also updated the signature of `vtable->vaCreateSurfaces2` to accept a `base::span<VASurfaceID>` instead of `VASurfaceID*`.

## Note
The error message clearly indicates the type mismatch between the function pointer and the assigned function, specifically at the 5th parameter.