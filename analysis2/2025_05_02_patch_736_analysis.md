# Build Failure Analysis: 2025_05_02_patch_736

## First error
../../gpu/command_buffer/service/gles2_cmd_decoder.cc:10770:49: error: no viable conversion from 'base::span<GLint>' (aka 'span<int>') to 'GLint *' (aka 'int *')

## Category
Pointer passed into spanified function parameter.

## Reason
The rewriter spanified the `DoGetTexParameteriv` and `GetTexParameterImpl` functions. However, the call site `api()->glGetTexParameterivFn(target, pname, iparams);` in `GLES2DecoderImpl::DoGetSamplerParameteriv` passes a `GLint*` to a function that now expects a `base::span<GLint>`.

## Solution
The rewriter needs to spanify the call sites of functions that have been spanified.

The signature of `glGetTexParameterivFn` is
```c++
  virtual void glGetTexParameterivFn(GLenum target,
                                      GLenum pname,
                                      GLint* params) = 0;
```

Since the code attempts to pass a `span<int>` where `GLint*` is expected, there are two possible approaches:
1. Rewrite `glGetTexParameterivFn` to take a `base::span<GLint>`.
2. Rewrite the call site in `GLES2DecoderImpl::DoGetSamplerParameteriv` to pass `iparams.data()`.

Because `glGetTexParameterivFn` is a virtual function, it is best to rewrite `glGetTexParameterivFn` because that would require fewer code changes, and avoid converting `base::span<GLint>` back to `GLint*`, and because `api()->glGetTexParameterivFn` is likely a third party function and cannot be rewritten.

## Note
The file `gpu/command_buffer/service/gles2_cmd_decoder_autogen.h` also has the same issue.
```
../../gpu/command_buffer/service/gles2_cmd_decoder_autogen.h:2018:38: error: no viable conversion from 'GLint *' (aka 'int *') to 'base::span<GLint>' (aka 'span<int>')
 2018 |   DoGetTexParameteriv(target, pname, params, num_values);
      |                                      ^~~~~~