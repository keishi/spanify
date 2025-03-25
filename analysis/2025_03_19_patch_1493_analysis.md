# Build Failure Analysis: 2025_03_19_patch_1493

## First error

../../gpu/command_buffer/service/gles2_cmd_decoder_autogen.h:1204:29: error: no viable conversion from 'GLuint *' (aka 'unsigned int *') to 'base::span<const GLuint>' (aka 'span<const unsigned int>')

## Category
Rewriter failing to recognize raw pointer passed to spanified function.

## Reason
The function `GenSamplersHelper` was spanified, but the call site in
`GLES2DecoderImpl::GenSamplersHelper` was not correctly updated to pass a
`base::span`. The rewriter failed to recognize that the argument `samplers_safe`
is a raw pointer and the size information is unavailable at the call site.

## Solution
The rewriter logic needs to be updated to correctly handle raw pointers being
passed to spanified functions when the size information is not available.
Ideally the rewriter should not spanify such functions.

## Note
No additional notes.