# Build Failure Analysis: 2025_03_15_patch_1856

## First error

../../base/memory/scoped_refptr.h:151:16: error: no matching constructor for initialization of 'media::AudioBuffer'

## Category
Pointer passed into spanified function parameter.

## Reason
The rewriter changed the signature of `AudioBuffer::CopyBitstreamFrom` to take a `base::span<const uint8_t* const> data`. At the callsite, `media/mojo/common/media_type_converters.cc`, the code passes `&data` where `data` is a `uint8_t*`. The type of `&data` is `uint8_t**`, which is converted to `base::span<uint8_t*, 1>`. This doesn't match the function parameter type `base::span<const uint8_t* const>`, so compilation fails. The call site needs to be updated to pass the correct type of argument, which is `base::span<const uint8_t* const>(&data, 1)`.

## Solution
The rewriter needs to also update the call site of `AudioBuffer::CopyBitstreamFrom` to pass in an argument of type `base::span<const uint8_t* const>`.

```c++
return media::AudioBuffer::CopyBitstreamFrom(
    input->sample_format, input->channel_layout, input->channel_count,
    input->sample_rate, input->frame_count, base::span<const uint8_t* const>(&data, 1),
    input->data.size(), input->timestamp);
```

## Note
None