```
# Build Failure Analysis: 2025_03_14_patch_1519

## First error

../../gpu/command_buffer/service/gles2_cmd_decoder.cc:9470:46: error: out-of-line definition of 'DoMultiDrawArrays' does not match any declaration in 'gpu::gles2::GLES2DecoderImpl'

## Category
Pointer passed into spanified function parameter.

## Reason
The function `DoMultiDrawArrays` was spanified but the definition does not match the declaration. This can happen when the patch is not applied correctly or the signature change wasn't applied to both the header and the source file.

## Solution
Ensure that the function definition matches the function declaration. In this case the `firsts` argument of `GLES2DecoderImpl::DoMultiDrawArrays` in the .h file should be of type `base::span<const GLint>`.

## Note
The following lines also contain errors due to incorrect `base::span` constructor usage:
*   `../../gpu/command_buffer/service/gles2_cmd_decoder.cc:9602`
*   `../../gpu/command_buffer/service/gles2_cmd_decoder.cc:9619`
*   `../../gpu/command_buffer/service/gles2_cmd_decoder.cc:9641`

These errors indicate that a `GLint*` is being passed to a function expecting a `base::span<GLint, 1>`. The fix is to use `base::make_span` instead of using the `base::span` constructor directly.

The following lines also contain errors where a `std::vector<GLint>` is passed where `const GLint*` is expected:
*   `../../gpu/command_buffer/service/gles2_cmd_decoder.cc:9950`
*   `../../gpu/command_buffer/service/gles2_cmd_decoder.cc:9955`
*   `../../gpu/command_buffer/service/gles2_cmd_decoder.cc:9961`