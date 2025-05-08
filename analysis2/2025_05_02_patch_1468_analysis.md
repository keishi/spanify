# Build Failure Analysis: 2025_05_02_patch_1468

## First error
../../base/functional/bind_internal.h:1603:21: error: static assertion failed: Type mismatch between bound argument and bound functor's parameter.

## Category
Pointer passed into spanified function parameter.

## Reason
The function `IsTraceArgumentNameAllowlisted` was spanified, but the `base::BindRepeating` call still passes a `const char* const*` which is not compatible with the `base::span<const char* const>` parameter. The call site was not updated to use the spanified function signature.

## Solution
The rewriter needs to update the call sites of spanified functions to use spans as well. The arguments passed in `base::BindRepeating` need to be adapted to work with the new function signature. If `allowlist_entry.arg_name_filter` is an array, consider using `base::make_span` or passing the size explicitly if available.