# Build Failure Analysis: 2025_03_19_patch_1665

## First error

../../third_party/blink/renderer/platform/heap/test/heap_test.cc:2157:25: error: no matching conversion for functional-style cast from 'int *' to 'base::span<int, 1>'

## Category
Rewriter failing to recognize raw pointer passed to spanified function.

## Reason
The rewriter transformed `int* key = &k;` to `base::span<int> key = base::span<int, 1>(&k);`, but failed to recognize that it needs to use `.data()` in the call sites. The root cause is that the HashMap expects `void*`, not `base::span<int>`.

## Solution
The rewriter needs to add `.data()` to the RHS: `base::span<int> key = base::span<int, 1>(&k).data();`

## Note
Lots of other errors exist. All are related to the failure to convert `base::span` to raw pointer.