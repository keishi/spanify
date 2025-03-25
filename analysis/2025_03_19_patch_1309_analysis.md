# Build Failure Analysis: 2025_03_19_patch_1309

## First error

../../components/gwp_asan/crash_handler/crash_analyzer.cc:485:43: error: no viable conversion from 'pointer' (aka 'unsigned short *') to 'base::span<const MetadataIdx>' (aka 'span<const unsigned short>')

## Category
Rewriter failing to recognize raw pointer passed to spanified function.

## Reason
The function that this argument is being passed to was spanified, but this call site is passing a raw pointer where the size is not available. The error message indicates there are no valid constructors for `base::span<const MetadataIdx>` that can accept a `pointer` (aka `unsigned short *`). This means the rewriter failed to recognize that `slot_to_metadata.get()` is a raw pointer and that it needs to be converted to a span. The root cause is the rewriter failing to recognize a size info unavailable rhs value.

## Solution
The rewriter needs to be able to handle the case where a raw pointer is passed to a spanified function, and the size information is not directly available. The rewriter needs to recognize `slot_to_metadata.get()` as a raw pointer expression and then generate the appropriate span construction logic. One approach would be add code to compute the size for `slot_to_metadata`. If there is no size, then the rewriter needs to avoid spanifying the argument in the first place.

## Note
There were additional template constructors that didn't match.