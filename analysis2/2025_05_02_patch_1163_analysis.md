# Build Failure Analysis: 2025_05_02_patch_1163

## First error

```
../../base/memory/scoped_refptr.h:151:16: error: no matching constructor for initialization of 'media::AudioBuffer'
  151 |   T* obj = new T(std::forward<Args>(args)...);
      |                ^ ~~~~~~~~~~~~~~~~~~~~~~~~
```

## Category
Pointer passed into spanified function parameter.

## Reason
The `AudioBuffer::CopyFrom` function signature was updated to take a `base::span<const uint8_t* const> data` argument, however the constructor for `AudioBuffer` was not updated to match. The `base::MakeRefCounted<AudioBuffer>` call in `AudioBuffer::CopyFrom` attempts to construct an `AudioBuffer` with a `base::span<const uint8_t* const>` argument, but there is no suitable constructor available.

## Solution
The `AudioBuffer` constructor needs to be updated to accept a `base::span<const uint8_t* const>` argument instead of `const uint8_t* const* data`. Update the appropriate constructor in `media/base/audio_buffer.cc` to accept `base::span<const uint8_t* const> data`.

## Note
The patch also changes some call sites of AudioBuffer::CopyFrom, but only changes the signature of the function in the header file. The call sites had to be adjusted since the meaning of parameter "data" changes from raw pointer to span.