# Build Failure Analysis: 2025_03_14_patch_1782

## First error

../../base/allocator/partition_allocator/src/partition_alloc/pointers/raw_ptr.h:781:22: error: no matching function for call to 'Retreat'

## Category
Rewriter needs to avoid pointer arithmetic on spanified variables.

## Reason
The rewriter converted `QuerySync* sync_mem` to `base::span<QuerySync> sync_mem` in `QuerySyncManager::Bucket`.  However, the expression `sync - bucket->syncs` in the `index()` method is performing pointer arithmetic on the `base::span` object, which is incorrect. It's attempting to calculate an offset between a pointer and a span, when it should be operating on offsets within the span.

Also, code in the FreePendingSyncs method is trying to use pointer arithmetic instead of iterators or subspan.

## Solution
Change the code to work with iterators or indices instead of pointer arithmetic when operating on spanified variables.

Specifically:

1.  In `QuerySyncManager::QueryInfo`, the `index()` method is calculating the index by subtracting `bucket->syncs` which is now a `base::span` object instead of a pointer to the first element of the array. Since span does not overload the '-' operator to work with raw pointers. To fix this, we can create a temporary `base::span` that points to just that element.

   ```c++
   uint32_t index() const { return sync - bucket->syncs; }
   ```

   Should be updated to this (or something similar):

   ```c++
   uint32_t index() const { return sync - bucket->syncs.data(); }
   ```
2. In the FreePendingSyncs method we need to operate on elements inside the span using the [] operator instead of the `data()` method + pointer arithmetic
```c++
     QuerySync* sync = this->syncs.subspan(pending.index).data();
```
Should be changed to:
```c++
     QuerySync& sync = this->syncs[pending.index];
```

## Note
The compiler also reports errors about passing `base::span<QuerySync, AllowPtrArithmetic>` to functions that expect `void*`. It is important to change `buckets_.front()->syncs` to use `.data()` to fix those errors, or rewrite the function to accept a span instead of a raw pointer. The specific lines are:
```c++
mapped_memory_->Free(buckets_.front()->syncs);
mapped_memory_->FreePendingToken(bucket->syncs, token);
mapped_memory_->Free(bucket->syncs);