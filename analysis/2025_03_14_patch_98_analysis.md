```
# Build Failure Analysis: 2025_03_14_patch_98

## First error

../../media/base/audio_bus.h:328:3: error: no matching function for call to 'CopyConvertFromInterleavedSourceToAudioBus'

## Category
Pointer passed into spanified function parameter.

## Reason
The rewriter spanified the function `AudioBus::CopyConvertFromInterleavedSourceToAudioBus`, but failed to spanify a call site. The function expects `base::span<const typename SourceSampleTypeTraits::ValueType>`, but the caller `result->FromInterleaved` is passing a raw pointer.

## Solution
Spanify the caller so that it calls `AudioBus::CopyConvertFromInterleavedSourceToAudioBus` with a `base::span`.

```diff
--- a/remoting/protocol/audio_pump.cc
+++ b/remoting/protocol/audio_pump.cc
@@ -33,7 +33,7 @@
   DCHECK_EQ(channels, result->channels());
   DCHECK_EQ(sample_rate, result->sample_rate());
 
-  result->FromInterleaved<media::SignedInt16SampleTypeTraits>(
+  result->FromInterleaved<media::SignedInt16SampleTypeTraits>(base::span(
       source_buffer_.get(), audio_size / sizeof(media::AudioBus::SampleType)));
 }
 

```

## Note
None