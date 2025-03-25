# Build Failure Analysis: 2025_03_19_patch_1448

## First error

../../ui/base/resource/data_pack.cc:350:27: error: no viable conversion from 'const Entry *' to 'base::span<const Entry>'

## Category
Rewriter failed to add `.data()` to a spanified return value.

## Reason
`LookupEntryById` was spanified, but the return value `ret` is not being correctly converted to a `base::span`. The code attempts to directly assign a raw pointer (`const Entry*`) to a `base::span<const Entry>`, which is not a valid conversion. The rewriter needs to add `.data()` when `data()` was spanified.

## Solution
The rewriter should be modified to handle the spanification of functions returning raw pointers. When `data()` is spanified, the rewriter needs to add `.data()` to a spanified return value when it is used as a raw pointer.

## Note
Several other errors in the build log also stem from the failure to adapt the raw pointer to span conversions. These include comparison operations and member accesses on the spanified variable. The other errors are a direct consequence of the failure to handle this type of return case when creating spans.