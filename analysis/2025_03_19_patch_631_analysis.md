# Build Failure Analysis: 2025_03_19_patch_631

## First error

../../media/formats/webm/cluster_builder.h:30:51: error: no viable conversion from returned value of type 'const base::HeapArray<uint8_t>' (aka 'const HeapArray<unsigned char>') to function return type 'const base::span<uint8_t>' (aka 'const span<unsigned char>')

## Category
Rewriter failed to add `.data()` to a spanified return value.

## Reason
The rewriter changed the return type of `Cluster::data()` to `base::span<uint8_t>`, but it did not update the return statement. The return statement still attempts to implicitly convert the `base::HeapArray<uint8_t>` to `base::span<uint8_t>`. This conversion requires constructing a `base::span` from a `base::HeapArray`, which isn't directly supported.

## Solution
The rewriter should add `.data()` to the returned HeapArray so it is trivially convertible to a span.

## Note
Extra `.data()` were also added when constructing the span. The rewriter should only add `.data()` when it is needed.