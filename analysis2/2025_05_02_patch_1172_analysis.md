# Build Failure Analysis: 2025_05_02_patch_1172

## First error

../../gpu/command_buffer/service/gles2_cmd_decoder.cc:5921:39: error: no viable conversion from 'base::span<GLint>' (aka 'span<int>') to 'GLint *' (aka 'int *')
 5921 |         api()->glGetIntegervFn(pname, params);
      |                                       ^~~~~~
../../ui/gl/gl_bindings_autogen_gl.h:3107:53: note: passing argument to parameter 'params' here
 3107 |   virtual void glGetIntegervFn(GLenum pname, GLint* params) = 0;
      |                                                     ^

## Category
Pointer passed into spanified function parameter.

## Reason
The function `GLES2DecoderImpl::GetHelper` is calling `api()->glGetIntegervFn` which expects a `GLint*` as a parameter. However, `GLES2DecoderImpl::GetHelper` now receives a `base::span<GLint>` as a parameter named params. The compiler is complaining that it cannot convert a `base::span<GLint>` to a `GLint*`. This means that the rewriter spanified the `GLES2DecoderImpl::GetHelper` function, but failed to spanify the call site in `../../ui/gl/gl_bindings_autogen_gl.h`.

## Solution
The rewriter needs to also spanify the `glGetIntegervFn` function in `../../ui/gl/gl_bindings_autogen_gl.h`.

## Note
This is a common problem with the rewriter, and it is important to make sure that all call sites of a spanified function are also spanified.