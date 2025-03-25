# Build Failure Analysis: 2025_03_19_patch_1634

## First error

../../mojo/public/c/system/tests/core_api_unittest.cc:115:28: error: no viable conversion from 'Handle *' to 'base::span<const Handle>'

## Category
Rewriter failing to recognize raw pointer passed to spanified function.

## Reason
The function `mojo::WaitMany` was spanified, but the call site in
`mojo/public/c/system/tests/core_api_unittest.cc` is passing a raw pointer
(`&handle0`) where the size is not available. The rewriter failed to
recognize a size info unavailable rhs value. The rewriter should have
detected this case and not performed the rewrite.

## Solution
The rewriter needs to be able to recognize when it is impossible to determine
the size of a pointer being passed to a spanified function, and avoid
performing the rewrite in such cases. It's also possible that the rewriter
could generate a fix by creating a temporary `base::span` at the call site,
but that approach is more complex and potentially less desirable.

## Note
There are multiple errors of the same kind in this build failure.