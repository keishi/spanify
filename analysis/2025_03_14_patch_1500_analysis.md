# Build Failure Analysis: 2025_03_14_patch_1500

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
The function `glGetTexParameterfvFn` in `ui/gl/gl_bindings_autogen_gl.h` expects a `GLfloat*` (which is a `float*`), but the rewriter has changed the corresponding parameter `fparams` in `GLES2DecoderImpl::GetTexParameterImpl` to `base::span<GLfloat>`. This results in a type mismatch at the call site. The rewriter has spanified the implementation, but failed to spanify the function pointer type.

## Solution
The rewriter should spanify the function pointer type `glGetTexParameterfvFn` to accept `base::span<GLfloat>` rather than `GLfloat*`. However, `ui/gl/gl_bindings_autogen_gl.h` is auto-generated code and shouldn't be modified directly.
The rewriter needs to avoid spanifying functions if it requires spanifying excluded code.

## Note
The same error exists for glGetTexParameteriv.
The error message in gles2_cmd_decoder_autogen.h indicates similar situation happened in other auto-generated file.