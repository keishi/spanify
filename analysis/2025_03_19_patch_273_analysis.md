# Build Failure Analysis: 2025_03_19_patch_273

## First error

../../base/memory/scoped_refptr.h:151:16: error: no matching constructor for initialization of 'media::AudioBuffer'
  151 |   T* obj = new T(std::forward<Args>(args)...);
      |                ^ ~~~~~~~~~~~~~~~~~~~~~~~~
../../media/base/audio_buffer.cc:304:16: note: in instantiation of function template specialization 'base::MakeRefCounted<media::AudioBuffer, base::PassKey<media::AudioBuffer>, media::SampleFormat &, media::ChannelLayout &, int &, int &, int &, bool, base::span<const unsigned char *const> &, int, const base::TimeDelta &, scoped_refptr<AudioBufferMemoryPool>>' requested here
  304 |   return base::MakeRefCounted<AudioBuffer>(
      |                ^
../../media/base/audio_buffer.cc:123:14: note: candidate constructor not viable: no known conversion from 'base::span<const unsigned char *const>' to 'const uint8_t *const *' (aka 'const unsigned char *const *') for 8th argument

## Category
Pointer passed into spanified function parameter.

## Reason
The rewriter spanified the `AudioBuffer::CopyFrom` function, but failed to spanify the call site.

## Solution
The rewriter needs to be able to spanify all call sites when spanifying a function.

## Note
There are three instances of this same error.