# Build Failure Analysis: 2025_03_14_patch_619

## First error

../../components/gwp_asan/crash_handler/crash_analyzer.cc:408:43: error: no viable conversion from 'pointer' (aka 'unsigned short *') to 'base::span<const MetadataIdx>' (aka 'span<const unsigned short>')

## Category
Rewriter needs to generate code to construct a span from a raw pointer and a size.

## Reason
The function `AllocatorState::GetMetadataForAddress` is being called with a raw pointer `slot_to_metadata.get()` where a span is expected. The rewriter needs to construct a span from this raw pointer.

## Solution
The rewriter should generate code to construct a span from a raw pointer and size when a function expects a span. The size is already known at the callsite.

```c++
   AllocatorState::GetMetadataForAddress(
       exception_addr, metadata_arr.get(), slot_to_metadata.get(), &metadata_idx,
+      base::span<const MetadataIdx>(slot_to_metadata.get(), kSize),
       &metadata_idx,
       error);
 ```

## Note
kSize should be replaced by the number of elements in the metadata index.