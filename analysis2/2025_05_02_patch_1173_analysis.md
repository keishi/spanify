# Build Failure Analysis: 2025_05_02_patch_1173

## First error

../../gpu/command_buffer/service/gles2_cmd_decoder.cc:6421:35: error: no viable conversion from 'base::span<GLfloat>' (aka 'span<float>') to 'GLfloat *' (aka 'float *')
 6421 |       api()->glGetFloatvFn(pname, params);
      |                                   ^~~~~~
../../ui/gl/gl_bindings_autogen_gl.h:3041:53: note: passing argument to parameter 'params' here
 3041 |   virtual void glGetFloatvFn(GLenum pname, GLfloat* params) = 0;
      |                                                     ^

## Category
Pointer passed into spanified function parameter.

## Reason
The rewriter spanified `GLES2DecoderImpl::DoGetFloatv`, but failed to update the call site in `GLES2DecoderImpl::DoGetFloatv` to pass `params.data()` to `api()->glGetFloatvFn(pname, params)`.

## Solution
The rewriter needs to spanify the call site, converting the `GLfloat* params` argument to `params.data()`.