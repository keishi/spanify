# Build Failure Analysis: 2025_03_19_patch_465

## First error

../../components/gwp_asan/crash_handler/crash_analyzer.cc:330:53: error: no viable conversion from 'pointer' (aka 'gwp_asan::internal::LightweightDetectorState::SlotMetadata *') to 'base::span<SlotMetadata>'

## Category
Rewriter failing to recognize raw pointer passed to spanified function.

## Reason
The function `LightweightDetectorState::HasMetadataForId` was spanified in the header file:
```c++
bool HasMetadataForId(MetadataId, base::span<SlotMetadata> metadata_arr);
```

But the call site in `crash_analyzer.cc` is passing a raw pointer:

```c++
if (valid_state.HasMetadataForId(*candidate_id, metadata_arr.get()))
```

The rewriter failed to automatically convert the raw pointer to a `base::span`.

## Solution
The rewriter should recognize when a raw pointer `metadata_arr.get()` is being passed to a function expecting a `base::span`, and automatically wrap the raw pointer with a `base::span` constructor, if the size is unknown then use a `base::span`'s constructor. The rewriter might also want to use `base::make_span` but a constructor is probably better. In this case since `.get()` returns a raw pointer, the size is unavailable. Thus this call site should be modified as:

```c++
if (valid_state.HasMetadataForId(*candidate_id, base::span(metadata_arr.get(), valid_state.num_metadata()))) {
```

## Note
A similar error is present in line 358 of `crash_analyzer.cc`.
```c++
  valid_state.GetSlotMetadataById(*metadata_id, metadata_arr.get());
```

This error is also fixable by wrapping `metadata_arr.get()` in a `base::span` constructor with proper size `valid_state.num_metadata()` if it isn't |0|.
```c++
  valid_state.GetSlotMetadataById(*metadata_id, base::span(metadata_arr.get(), valid_state.num_metadata()));