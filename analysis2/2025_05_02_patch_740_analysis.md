# Build Failure Analysis: 2025_05_02_patch_740

## First error

../../gpu/command_buffer/service/gles2_cmd_decoder.cc:6448:58: error: no viable conversion from 'base::span<GLint64>' (aka 'span<long>') to 'GLint64 *' (aka 'long *')

## Category
Pointer passed into spanified function parameter.

## Reason
The error occurs in `GLES2DecoderImpl::DoGetInteger64v` because `params` is now a `base::span<GLint64>`, but the function `api()->glGetInteger64vFn` expects a `GLint64*`. The rewriter spanified the definition of `DoGetInteger64v`, but failed to spanify the call site in `GLBindings::glGetInteger64vFn`.

## Solution
The rewriter spanified a function, but failed to spanify a call site.

## Note
The second error is in `gles2_cmd_decoder_autogen.h` because the definition of `DoGetInteger64v` was spanified, but the autogenerated header wasn't updated.