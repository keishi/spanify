# Build Failure Analysis: 2025_03_19_patch_1362

## First error

../../base/tools_sanity_unittest.cc:146:28: error: no viable conversion from 'int *' to 'volatile base::span<int>'

## Category
Rewriter does not handle assignment of spanified variable from an allocation using new.

## Reason
The line `int* volatile leak = new int[256];` was changed to `volatile base::span<int> leak = new int[256];`. This is not handled by the rewriter. The rewriter should not use `base::span` with `new`.

## Solution
The rewriter should not transform assignment of spanified variable from an allocation using new. This code should use a owned type like unique_ptr or a collection.