# Build Failure Analysis: 2025_03_19_patch_275

## First error

../../media/base/audio_buffer.cc:304:16: error: no matching constructor for initialization of 'media::AudioBuffer'
  304 |   return base::MakeRefCounted<AudioBuffer>(
      |                ^

## Category
Pointer passed into spanified function parameter.

## Reason
The function signature of `AudioBuffer` has been updated to take `base::span<const uint8_t* const> data` instead of `const uint8_t* const* data`. However, there is a call site that passes `data` as `const uint8_t* const*` which is resulting in a type mismatch.

## Solution
The rewriter needs to spanify a call site when the rewritten function accepts a span.

## Note
There are other call sites that have the same issue. The solution should fix all of these.