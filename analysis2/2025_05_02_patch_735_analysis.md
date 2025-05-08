# Build Failure: 2025_05_02_patch_735

## First error

no viable conversion from 'const volatile GLenum *' (aka 'const volatile unsigned int *') to 'base::span<const volatile GLenum>' (aka 'span<const volatile unsigned int>')

## Category
Rewriter failing to recognize raw pointer passed to spanified function.

## Reason
The function `GLES2DecoderImpl::DoDrawBuffersEXT` was spanified, but the call site `DoDrawBuffersEXT(count, bufs)` in `gles2_cmd_decoder_autogen.h` passes a raw pointer `bufs`. The rewriter failed to recognize that the call site needs to be updated to construct a span from the raw pointer, probably because it is auto generated.

## Solution
The rewriter needs to correctly handle raw pointers being passed to spanified functions, even when the callsite is in generated code.

## Note
`gles2_cmd_decoder_autogen.h` is auto generated code, so perhaps functions in generated code should not be spanified in the first place.