# Build Failure Analysis: 2025_05_02_patch_1663

## First error

`no matching function for call to 'Retreat'`

## Category

Rewriter needs to account for pointer arithmetic with spanified member variables.

## Reason

The `QueryInfo::index()` method is performing pointer arithmetic with a `raw_ptr` and a `base::raw_span` member variable. The `Retreat` function, used internally by `raw_ptr`, doesn't have an overload that supports pointer arithmetic with `base::raw_span`. The expression `sync - bucket->syncs` where `sync` is `raw_ptr<QuerySync>` and `bucket->syncs` is `base::raw_span<QuerySync>`, causes this error.

## Solution

The `QueryInfo::index()` method needs to be rewritten to correctly calculate the index from the span. This requires accessing the underlying pointer of the `base::raw_span` and performing the subtraction there. The code becomes:

```c++
uint32_t index() const { return sync - bucket->syncs.data(); }
```

## Note

The second error `no viable conversion from returned value of type 'raw_ptr<gpu::QuerySync, 9>' to function return type 'uint32_t'` is a consequence of the first error not being fixed.