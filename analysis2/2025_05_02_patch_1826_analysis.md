# Build Failure Analysis: 2025_05_02_patch_1826

## First error

```
../../components/gwp_asan/crash_handler/crash_analyzer.cc:485:23: error: no viable conversion from 'pointer' (aka 'gwp_asan::internal::AllocatorState::SlotMetadata *') to 'base::span<const SlotMetadata>'
  485 |       exception_addr, metadata_arr.get(), slot_to_metadata.get(), &metadata_idx,
      |                       ^~~~~~~~~~~~~~~~~~
```

## Category
Rewriter failing to recognize raw pointer passed to spanified function.

## Reason
The function `AllocatorState::GetMetadataForAddress` was spanified, but the callsite in `crash_analyzer.cc` passes `metadata_arr.get()` which returns a raw pointer `SlotMetadata *`. The rewriter isn't able to deduce the size of `metadata_arr` at this callsite, so the conversion to `base::span` fails. The rewriter has converted `SlotMetadata* metadata_arr` to `base::span<const SlotMetadata> metadata_arr` and expects that `metadata_arr` should have been spanified at the call site as well.

## Solution
The rewriter should create a span at the call site if it can determine the size of the buffer. In this case the size is known, the `metadata_arr` is `std::unique_ptr<SlotMetadata[]> metadata_arr_;`.

The rewriter needs to be updated to automatically convert `metadata_arr.get()` to `base::span(metadata_arr.get(), kNumSlots)` where `kNumSlots` is a constant that defines the size.

## Note
There are no additional errors.