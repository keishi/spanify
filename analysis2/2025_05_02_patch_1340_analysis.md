# Build Failure Analysis: 2025_05_02_patch_1340

## First error

```
../../media/gpu/vaapi/test/fake_libva_driver/fake_drv_video.cc:914:35: error: assigning to 'VAStatus (*)(VADriverContextP, VAProfile *, int *)' (aka 'int (*)(VADriverContext *, VAProfile *, int *)') from incompatible type 'VAStatus (VADriverContextP, base::span<VAProfile>, int *)' (aka 'int (VADriverContext *, span<VAProfile>, int *)'): type mismatch at 2nd parameter ('VAProfile *' vs 'base::span<VAProfile>')
  914 |   vtable->vaQueryConfigProfiles = FakeQueryConfigProfiles;
      |                                   ^~~~~~~~~~~~~~~~~~~~~~~
```

## Category
Pointer passed into spanified function parameter.

## Reason
The rewriter spanified the `profile_list` parameter in `FakeQueryConfigProfiles`. However, the function pointer `vtable->vaQueryConfigProfiles` expects a `VAProfile*`, not a `base::span<VAProfile>`. The rewriter modified the function signature of `FakeQueryConfigProfiles` but didn't update the call site in the vtable.

## Solution
The rewriter must also update the vtable to accept `base::span<VAProfile>` or not spanify the function parameter. Since vtable is likely a third_party interface, the correct solution here is to not spanify the function parameter.

## Note
None