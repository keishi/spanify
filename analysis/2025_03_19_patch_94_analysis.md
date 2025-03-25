# Build Failure Analysis: 2025_03_19_patch_94

## First error

no matching function for call to 'CopyConvertFromAudioBusToInterleavedTarget'

## Category
Pointer passed into spanified function parameter.

## Reason
The rewriter changed the signature of `CopyConvertFromAudioBusToInterleavedTarget` to take a `base::span` argument, but didn't update the call site in `ToInterleavedPartial`.

The error message is:
```
../../media/base/audio_bus.h:346:3: error: no matching function for call to 'CopyConvertFromAudioBusToInterleavedTarget'
  346 |   CopyConvertFromAudioBusToInterleavedTarget<TargetSampleTypeTraits>(
      |   ^~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
../../media/cast/encoding/audio_encoder.cc:324:16: note: in instantiation of function template specialization 'media::AudioBus::ToInterleavedPartial<media::FloatSampleTypeTraits<float>>' requested here
  324 |     audio_bus->ToInterleavedPartial<Float32SampleTypeTraits>(
      |                ^
../../media/base/audio_bus.h:268:15: note: candidate function template not viable: no known conversion from 'typename FloatSampleTypeTraits<float>::ValueType *' (aka 'float *') to 'base::span<typename FloatSampleTypeTraits<float>::ValueType>' (aka 'span<float>') for 4th argument
  268 |   static void CopyConvertFromAudioBusToInterleavedTarget(
      |               ^
  269 |       const AudioBus* source,
  270 |       int read_offset_in_frames,
  271 |       int num_frames_to_read,
  272 |       base::span<typename TargetSampleTypeTraits::ValueType> dest_buffer);
      |       ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

```

## Solution
The rewriter needs to update the call site to pass a `base::span` instead of a raw pointer. It can construct a `base::span` from the raw pointer and the number of frames to read.
```c++
base::span<typename TargetSampleTypeTraits::ValueType> dest_buffer_span(
    dest_buffer, num_frames_to_read * channels);
CopyConvertFromAudioBusToInterleavedTarget<TargetSampleTypeTraits>(
    source, read_offset_in_frames, num_frames_to_read, dest_buffer_span);

```

## Note
The rewriter should not have changed the signature of `CopyConvertFromAudioBusToInterleavedTarget` without updating the call site.
```diff
--- a/media/base/audio_bus.h
+++ b/media/base/audio_bus.h
@@ -267,7 +269,7 @@ class MEDIA_SHMEM_EXPORT AudioBus {
       const AudioBus* source,
       int read_offset_in_frames,
       int num_frames_to_read,
-      typename TargetSampleTypeTraits::ValueType* dest_buffer);
+      base::span<typename TargetSampleTypeTraits::ValueType> dest_buffer);

```
```diff
--- a/media/base/audio_bus.h
+++ b/media/base/audio_bus.h
@@ -374,7 +376,7 @@ void AudioBus::CopyConvertFromAudioBusToInterleavedTarget(
     const AudioBus* source,
     int read_offset_in_frames,
     int num_frames_to_read,
-    typename TargetSampleTypeTraits::ValueType* dest_buffer) {
+    base::span<typename TargetSampleTypeTraits::ValueType> dest_buffer) {