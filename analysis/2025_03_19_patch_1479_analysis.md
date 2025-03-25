# Build Failure Analysis: 2025_03_19_patch_1479

## First error

../../gpu/command_buffer/service/gles2_cmd_decoder.cc:3466:17: error: no matching conversion for functional-style cast from 'float *' to 'base::span<float, 1>' (aka 'span<float>')
 3466 |                 base::span<float, 1>(&caps.max_texture_lod_bias), 1);
      |                 ^~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

## Category
Rewriter needs to avoid using reinterpret_cast on spanified variable.

## Reason
The code was rewritten as
```c++
     DoGetFloatv(GL_MAX_TEXTURE_LOD_BIAS,
                 base::span<float, 1>(&caps.max_texture_lod_bias), 1);
```

The rewriter should not be using address of (&) when constructing `base::span`.

## Solution
When constructing span, don't use address of (&). We should just use caps.max_texture_lod_bias.
```
 base::span<float, 1>(caps.max_texture_lod_bias), 1);
```

## Note
Also the rewriter failed to spanify the glGetFloatvFn API. This function should also have a span.
```c++
../../gpu/command_buffer/service/gles2_cmd_decoder.cc:6420:35: error: no viable conversion from 'base::span<GLfloat>' (aka 'span<float>') to 'GLfloat *' (aka 'float *')
 6420 |       api()->glGetFloatvFn(pname, params);
      |                                   ^~~~~~
../../ui/gl/gl_bindings_autogen_gl.h:3041:53: note: passing argument to parameter 'params' here
 3041 |   virtual void glGetFloatvFn(GLenum pname, GLfloat* params) = 0;
      |