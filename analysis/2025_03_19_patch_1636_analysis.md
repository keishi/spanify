# Build Failure Analysis: 2025_03_19_patch_1636

## First error

../../mojo/public/cpp/system/tests/wait_unittest.cc:204:29: error: no matching function for call to 'WaitMany'

## Category
Pointer passed into spanified function parameter.

## Reason
The rewriter spanified the `WaitMany` function in `mojo/public/cpp/system/wait.h`, but failed to spanify the call site in `mojo/public/cpp/system/tests/wait_unittest.cc`. The fifth argument `hss` is a C-style array which cannot be implicitly converted to `base::span<MojoHandleSignalsState>`.

## Solution
The rewriter needs to be able to update the call site when a function parameter is spanified. In this case, it needs to change the `hss` variable to `base::span<MojoHandleSignalsState>`.

## Note
All the errors in the build log have the same root cause. The `WaitMany` function was spanified, but the call sites were not updated.