```
# Build Failure Analysis: 2025_05_02_patch_289

## First error

```
../../mojo/public/cpp/bindings/lib/array_internal.h:535:26: error: no viable conversion from 'StorageType *' (aka 'mojo::internal::Pointer<tracing::mojom::internal::ChunksToMove_Data> *') to 'base::span<StorageType>' (aka 'span<mojo::internal::Pointer<tracing::mojom::internal::ChunksToMove_Data>>')
  535 |     return Traits::ToRef(storage(), offset, header_.num_elements);
      |                          ^~~~~~~~~
```

## Category
Rewriter needs to avoid spanifying functions if it requires spanifying excluded code.

## Reason
The rewriter introduced a `base::span` parameter to `ArrayDataTraits::ToRef`, but the call site passes a raw pointer (`StorageType*`) to the function. `ArrayDataTraits` is used in `mojo`, which is excluded from the rewriter.

## Solution
The rewriter should not attempt to spanify functions in `mojo` as it requires spanifying excluded code.