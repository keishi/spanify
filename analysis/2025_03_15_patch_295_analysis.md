```
# Build Failure Analysis: 2025_03_15_patch_295

## First error

../../gpu/command_buffer/service/gles2_cmd_decoder_autogen.h:1111:28: error: no viable conversion from 'GLuint *' (aka 'unsigned int *') to 'base::span<const GLuint>' (aka 'span<const unsigned int>')
1111 |       !GenBuffersHelper(n, buffers_safe)) {
     |                            ^~~~~~~~~~~~

## Category
Pointer passed into spanified function parameter.

## Reason
The rewriter spanified a function, but failed to spanify a call site. In this case, the function `GLES2DecoderImpl::GenBuffersHelper` was spanified but the call site in `GLES2DecoderImpl::DoGenBuffers` was not updated to pass a span.

## Solution
The rewriter needs to spanify the call site as well.

## Note
The call site in question was inside a generated file, which may have been excluded from the rewriter: gpu/command_buffer/service/gles2_cmd_decoder_autogen.h