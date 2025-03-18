# Build Failure Analysis: 2025_03_14_patch_116

## First error

../../third_party/blink/renderer/modules/webcodecs/audio_data.cc:115:33: error: reinterpret_cast from 'base::span<uint8_t>' (aka 'span<unsigned char>') to 'unsigned char *' is not allowed
  115 |   base::span<SampleType> dest = reinterpret_cast<SampleType*>(dest_data);
      |                                 ^~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

## Category
Rewriter needs to avoid spanifying functions if it requires spanifying excluded code.

## Reason
The spanify tool is trying to spanify CopyToInterleaved which is defined in third_party/blink. But base::span cannot be spanified so this function shouldn't have been spanified in the first place.

## Solution
The rewriter should avoid spanifying functions that require spanifying excluded code.