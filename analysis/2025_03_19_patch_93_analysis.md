# Build Failure Analysis: 2025_03_19_patch_93

## First error

../../media/base/audio_bus.h:328:3: error: no matching function for call to 'CopyConvertFromInterleavedSourceToAudioBus'
  328 |   CopyConvertFromInterleavedSourceToAudioBus<SourceSampleTypeTraits>(
      |   ^~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
../../media/base/audio_buffer.cc:588:11: note: in instantiation of function template specialization 'media::AudioBus::FromInterleavedPartial<media::FloatSampleTypeTraits<float>>' requested here
  588 |     dest->FromInterleavedPartial<Float32SampleTypeTraits>(
      |           ^
../../media/base/audio_bus.h:261:15: note: candidate function template not viable: no known conversion from 'const typename FloatSampleTypeTraits<float>::ValueType *' (aka 'const float *') to 'base::span<const typename FloatSampleTypeTraits<float>::ValueType>' (aka 'span<const float>') for 1st argument
  261 |   static void CopyConvertFromInterleavedSourceToAudioBus(
      |               ^

## Category
Pointer passed into spanified function parameter.

## Reason
The function `AudioBus::CopyConvertFromInterleavedSourceToAudioBus` has been spanified. The build failure indicates that a call site in `AudioBus::FromInterleavedPartial` is passing a raw pointer as the `source_buffer` argument, which is now expecting a `base::span`. The rewriter spanified the function, but failed to spanify a call site.

## Solution
The rewriter should wrap the raw pointer `source_buffer` with a `base::span` at the call site in `AudioBus::FromInterleavedPartial`.  The rewriter needs to determine the size of the buffer being passed to the `CopyConvertFromInterleavedSourceToAudioBus` function and pass it as the second argument to the span constructor.
```c++
// Old code
CopyConvertFromInterleavedSourceToAudioBus<SourceSampleTypeTraits>(
    source_buffer, write_offset_in_frames, num_frames_to_write, dest);

// New code (assuming source_buffer has num_frames_to_write frames)
CopyConvertFromInterleavedSourceToAudioBus<SourceSampleTypeTraits>(
    base::span<const typename SourceSampleTypeTraits::ValueType>(source_buffer, num_frames_to_write),
    write_offset_in_frames, num_frames_to_write, dest);
```

## Note
The build log shows multiple errors of the same nature. All of these errors must be fixed to resolve the build failure.
```
../../media/base/audio_bus.h:328:3: error: no matching function for call to 'CopyConvertFromInterleavedSourceToAudioBus'
../../media/base/audio_buffer.cc:588:11: note: in instantiation of function template specialization 'media::AudioBus::FromInterleavedPartial<media::FloatSampleTypeTraits<float>>' requested here
../../media/base/audio_bus.h:261:15: note: candidate function template not viable: no known conversion from 'const typename FloatSampleTypeTraits<float>::ValueType *' (aka 'const float *') to 'base::span<const typename FloatSampleTypeTraits<float>::ValueType>' (aka 'span<const float>') for 1st argument
```
```
../../media/base/audio_bus.h:328:3: error: no matching function for call to 'CopyConvertFromInterleavedSourceToAudioBus'
../../media/base/audio_buffer.cc:592:11: note: in instantiation of function template specialization 'media::AudioBus::FromInterleavedPartial<media::FixedSampleTypeTraits<unsigned char>>' requested here
../../media/base/audio_bus.h:261:15: note: candidate function template not viable: no known conversion from 'const typename FixedSampleTypeTraits<unsigned char>::ValueType *' (aka 'const unsigned char *') to 'base::span<const typename FixedSampleTypeTraits<unsigned char>::ValueType>' (aka 'span<const unsigned char>') for 1st argument
```
```
../../media/base/audio_bus.h:328:3: error: no matching function for call to 'CopyConvertFromInterleavedSourceToAudioBus'
../../media/base/audio_buffer.cc:595:11: note: in instantiation of function template specialization 'media::AudioBus::FromInterleavedPartial<media::FixedSampleTypeTraits<short>>' requested here
../../media/base/audio_bus.h:261:15: note: candidate function template not viable: no known conversion from 'const typename FixedSampleTypeTraits<short>::ValueType *' (aka 'const short *') to 'base::span<const typename FixedSampleTypeTraits<short>::ValueType>' (aka 'span<const short>') for 1st argument
```
```
../../media/base/audio_bus.h:328:3: error: no matching function for call to 'CopyConvertFromInterleavedSourceToAudioBus'
../../media/base/audio_buffer.cc:600:11: note: in instantiation of function template specialization 'media::AudioBus::FromInterleavedPartial<media::FixedSampleTypeTraits<int>>' requested here
../../media/base/audio_bus.h:261:15: note: candidate function template not viable: no known conversion from 'const typename FixedSampleTypeTraits<int>::ValueType *' (aka 'const int *') to 'base::span<const typename FixedSampleTypeTraits<int>::ValueType>' (aka 'span<const int>') for 1st argument
```

```c++
void AudioBus::ToInterleavedPartial(
    ChannelLayout channel_layout,
    int frame_offset,
    int num_frames,
    AudioBuffer* buffer) {
  DCHECK_GE(frame_offset, 0);
  DCHECK_LE(frame_offset + num_frames, frames());
  DCHECK_EQ(channel_layout, this->channel_layout());
 

  CHECK_EQ(SampleTypeTraits<SampleType>::is_float,
           SampleTypeTraits<Float32SampleTypeTraits::ValueType>::is_float);
 

  int buffer_length_in_frames = buffer->frame_count();
  const int frames_to_write = std::min(num_frames, buffer_length_in_frames);
  CHECK_GE(frames_to_write, 0);
 

  char* dest_buffer = buffer->channel_data()[0];
 

  // SampleFormatToBytesPerChannel(kSampleFormatF32)
  const int bytes_per_frame = NumChannels() * 4;
  int write_offset_in_frames = 0;
 

  char* source_buffer =
      dest_buffer + frame_offset * NumChannels() * 4;
  AudioBus* dest = this;
 

  // https://source.chromium.org/chromium/chromium/src/+/main:media/base/sample_format.h;l=108
  switch (buffer->sample_format()) {
    case kSampleFormatF32:
      dest->FromInterleavedPartial<Float32SampleTypeTraits>(
          reinterpret_cast<float*>(source_buffer),  // the size is write_offset_in_frames
          write_offset_in_frames, frames_to_write, dest);
      break;
    case kSampleFormatU8:
      dest->FromInterleavedPartial<UnsignedInt8SampleTypeTraits>(
          reinterpret_cast<unsigned char*>(source_buffer),
          write_offset_in_frames, frames_to_write, dest);
      break;
    case kSampleFormatS16:
      dest->FromInterleavedPartial<SignedInt16SampleTypeTraits>(
          reinterpret_cast<short*>(source_buffer), write_offset_in_frames,
          frames_to_write, dest);
      break;
    case kSampleFormatS32:
      dest->FromInterleavedPartial<SignedInt32SampleTypeTraits>(
          reinterpret_cast<int*>(source_buffer), write_offset_in_frames,
          frames_to_write, dest);
      break;
    default:
      NOTREACHED();
  }
}
```
```c++
template <class SourceSampleTypeTraits>
void AudioBus::CopyConvertFromInterleavedSourceToAudioBus(
    base::span<const typename SourceSampleTypeTraits::ValueType> source_buffer,
    int write_offset_in_frames,
    int num_frames_to_write,
    AudioBus* dest) {
  const size_t num_channels = dest->channels();
  const int frames_to_read = source_buffer.size() / num_channels;
  if (frames_to_read <= 0) {
    return;
  }

  const size_t frame_offset_in_channels =
      static_cast<size_t>(write_offset_in_frames) * num_channels;
  for (int channel = 0; channel < num_channels; ++channel) {
    dest->channel(channel)
        ->CopyFrom(source_buffer.subspan(channel, frames_to_read * num_channels), frame_offset_in_channels,
                   channel, write_offset_in_frames, frames_to_read);
  }
}
```
```c++
    case kSampleFormatF32:
      dest->FromInterleavedPartial<Float32SampleTypeTraits>(
          base::span<const float>(reinterpret_cast<float*>(source_buffer), frames_to_write * dest->NumChannels()),  //frames_to_write is the number of frames and the source buffer is interleaved, so the size is multiplied with NumChannels().
          write_offset_in_frames, frames_to_write, dest);
      break;
    case kSampleFormatU8:
      dest->FromInterleavedPartial<UnsignedInt8SampleTypeTraits>(
          base::span<const unsigned char>(reinterpret_cast<unsigned char*>(source_buffer), frames_to_write * dest->NumChannels()),
          write_offset_in_frames, frames_to_write, dest);
      break;
    case kSampleFormatS16:
      dest->FromInterleavedPartial<SignedInt16SampleTypeTraits>(
          base::span<const short>(reinterpret_cast<short*>(source_buffer), frames_to_write * dest->NumChannels()),
          write_offset_in_frames, frames_to_write, dest);
      break;
    case kSampleFormatS32:
      dest->FromInterleavedPartial<SignedInt32SampleTypeTraits>(
          base::span<const int>(reinterpret_cast<int*>(source_buffer), frames_to_write * dest->NumChannels()),
          write_offset_in_frames, frames_to_write, dest);
      break;