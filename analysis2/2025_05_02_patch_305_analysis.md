# Build Failure Analysis: 2025_05_02_patch_305

## First error

../../media/base/audio_bus.h:328:3: error: no matching function for call to 'CopyConvertFromInterleavedSourceToAudioBus'

## Category
Pointer passed into spanified function parameter.

## Reason
The function `AudioBus::CopyConvertFromInterleavedSourceToAudioBus` was spanified. However, the call site in `AudioBus::FromInterleavedPartial` is still passing a raw pointer instead of a span. The rewriter spanified a function, but failed to spanify a call site.

## Solution
The rewriter must ensure that all call sites to spanified functions are also updated to pass spans instead of raw pointers. In this case, the call to `CopyConvertFromInterleavedSourceToAudioBus` in `AudioBus::FromInterleavedPartial` needs to be updated to pass a span.

Change this:

```c++
CopyConvertFromInterleavedSourceToAudioBus<SourceSampleTypeTraits>(
```

To this:

```c++
CopyConvertFromInterleavedSourceToAudioBus<SourceSampleTypeTraits>(base::span<const typename SourceSampleTypeTraits::ValueType>(source_buffer, num_frames_to_write * channel_count()),
```

## Note
The error message indicates that the compiler cannot find a matching function for the call to `CopyConvertFromInterleavedSourceToAudioBus` because it expects a `base::span` as the first argument, but it's receiving a raw pointer (`const typename SourceSampleTypeTraits::ValueType*`).