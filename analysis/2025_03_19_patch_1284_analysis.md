```
# Build Failure Analysis: 2025_03_19_patch_1284

## First error

../../media/base/audio_bus_unittest.cc:519:36: error: invalid operands to binary expression ('const size_t' (aka 'const unsigned long') and 'std::unique_ptr<AudioBus>')
  519 |             .subspan(kPartialStart * bus)
      |                      ~~~~~~~~~~~~~ ^ ~~~

## Category
Rewriter needs to avoid spanifying functions if it requires spanifying excluded code.

## Reason
The code attempts to use the overloaded multiplication operator between `kPartialStart` and `bus`. `kPartialStart` is `const size_t` and `bus` is `std::unique_ptr<AudioBus>`. The rewriter has spanified the arguments of `subspan`, but hasn't spanified the overload of `operator*` that's used between a size and AudioBus.  The function that contains `operator*` is likely excluded, thus it should avoid spanifying.

## Solution
The rewriter should avoid spanifying functions if it requires spanifying excluded code.

## Note
Secondary errors:
```
../../media/base/audio_bus_unittest.cc:477:38: error: no viable conversion from 'const int32_t *' to 'base::span<const int, 10>' (aka 'span<const int>')
  477 |     bus->FromInterleaved<SignedInt32SampleTypeTraits>(kTestVectorInt32.data(),
      |                                                      ^~~~~~~~~~~~~~~~~~~~~
../../media/mojo/common/audio_data_s16_converter_unittest.cc:54:54: error: no viable conversion from 'const int16_t *' to 'base::span<const short, 10>' (aka 'span<const short>')
   54 |   audio_bus->FromInterleaved<SignedInt16SampleTypeTraits>(kTestVectorContents.data(),
      |                                                          ^~~~~~~~~~~~~~~~~~~~~~~~~~
../../third_party/blink/renderer/modules/mediastream/media_stream_audio_processor_test.cc:115:11: error: no viable conversion from 'const int16_t *' to 'base::span<const short>'
```
These are the same problem.