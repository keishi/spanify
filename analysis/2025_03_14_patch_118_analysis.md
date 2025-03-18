# Build Failure Analysis: 2025_03_14_patch_118

## First error

../../third_party/blink/renderer/modules/webcodecs/audio_data.cc:135:33: error: reinterpret_cast from 'base::span<uint8_t>' (aka 'span<unsigned char>') to 'unsigned char *' is not allowed

## Category
Rewriter needs to avoid reinterpret_cast from span to pointer.

## Reason
The code attempts to reinterpret_cast a `base::span<uint8_t>` to a `SampleType*`, where SampleType changes, but can be types such as `uint8_t`, `int16_t`, `int32_t`, or `float`. This is not allowed. `reinterpret_cast` on `base::span` is generally not safe because it can easily violate the type system.
Specifically the error is in this function:

```c++
template <typename SampleType>
void CopyToPlanar(base::span<uint8_t> dest_data,
                   const uint8_t* src_data,
                   const int src_channel_count,
                   const int dest_channel_index,
                   const int frame_offset,
                   const int frames_to_copy,
                   ExceptionState& exception_state) {
  base::span<SampleType> dest = reinterpret_cast<SampleType*>(dest_data);
```

The `dest_data` variable is `base::span<uint8_t>`, but that is then cast to `base::span<SampleType>`, which is invalid.

## Solution
The rewriter should not attempt to spanify the `CopyToPlanar` function since it uses reinterpret_cast.

## Note
The errors are:

```
../../third_party/blink/renderer/modules/webcodecs/audio_data.cc:135:33: error: reinterpret_cast from 'base::span<uint8_t>' (aka 'span<unsigned char>') to 'unsigned char *' is not allowed
../../third_party/blink/renderer/modules/webcodecs/audio_data.cc:751:16: note: in instantiation of function template specialization 'blink::(anonymous namespace)::CopyToPlanar<unsigned char>' requested here
  751 |       ::blink::CopyToPlanar<uint8_t>(dest, src_data, channels, channel_index,
      |                ^
../../third_party/blink/renderer/modules/webcodecs/audio_data.cc:135:33: error: reinterpret_cast from 'base::span<uint8_t>' (aka 'span<unsigned char>') to 'short *' is not allowed
  135 |   base::span<SampleType> dest = reinterpret_cast<SampleType*>(dest_data);
      |                                 ^~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
../../third_party/blink/renderer/modules/webcodecs/audio_data.cc:756:16: note: in instantiation of function template specialization 'blink::(anonymous namespace)::CopyToPlanar<short>' requested here
  756 |       ::blink::CopyToPlanar<int16_t>(dest, src_data, channels, channel_index,
      |                ^
../../third_party/blink/renderer/modules/webcodecs/audio_data.cc:135:33: error: reinterpret_cast from 'base::span<uint8_t>' (aka 'span<unsigned char>') to 'int *' is not allowed
  135 |   base::span<SampleType> dest = reinterpret_cast<SampleType*>(dest_data);
      |                                 ^~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
../../third_party/blink/renderer/modules/webcodecs/audio_data.cc:761:16: note: in instantiation of function template specialization 'blink::(anonymous namespace)::CopyToPlanar<int>' requested here
  761 |       ::blink::CopyToPlanar<int32_t>(dest, src_data, channels, channel_index,
      |                ^
../../third_party/blink/renderer/modules/webcodecs/audio_data.cc:135:33: error: reinterpret_cast from 'base::span<uint8_t>' (aka 'span<unsigned char>') to 'float *' is not allowed
  135 |   base::span<SampleType> dest = reinterpret_cast<SampleType*>(dest_data);
      |                                 ^~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
../../third_party/blink/renderer/modules/webcodecs/audio_data.cc:766:16: note: in instantiation of function template specialization 'blink::(anonymous namespace)::CopyToPlanar<float>' requested here
  766 |       ::blink::CopyToPlanar<float>(dest, src_data, channels, channel_index,