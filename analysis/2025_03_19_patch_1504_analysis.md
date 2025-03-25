# Build Failure Analysis: 2025_03_19_patch_1504

## First error

../../gpu/command_buffer/service/gles2_cmd_decoder.cc:10767:49: error: no viable conversion from 'base::span<GLfloat>' (aka 'span<float>') to 'GLfloat *' (aka 'float *')
 10767 |     api()->glGetTexParameterfvFn(target, pname, fparams);
       |                                                 ^~~~~~~
../../ui/gl/gl_bindings_autogen_gl.h:3337:47: note: passing argument to parameter 'params' here
 3337 |                                      GLfloat* params) = 0;
      |                                               ^

## Category
Pointer passed into spanified function parameter.

## Reason
The rewriter spanified `GLES2DecoderImpl::DoGetTexParameterfv`, but failed to spanify the call site `api()->glGetTexParameterfvFn`. The `glGetTexParameterfvFn` function in `../../ui/gl/gl_bindings_autogen_gl.h` still expects a `GLfloat*` (aka `float*`), but the code is now passing a `base::span<GLfloat>`.

## Solution
The rewriter needs to spanify the call site `api()->glGetTexParameterfvFn` in `GLES2DecoderImpl::GetTexParameterImpl` as well.

## Note
The rewriter also failed to spanify the call to  `GLES2DecoderImpl::GetTexParameterImpl` in `GLES2DecoderImpl::DoGetTexParameteriv`. This call site is being passed an empty span (`{}`). We may have to add a helper here to account for both float* and span.