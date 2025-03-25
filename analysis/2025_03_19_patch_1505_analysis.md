# Build Failure Analysis: 2025_03_19_patch_1505

## First error

../../gpu/command_buffer/service/gles2_cmd_decoder.cc:10769:49: error: no viable conversion from 'base::span<GLint>' (aka 'span<int>') to 'GLint *' (aka 'int *')

## Category
Pointer passed into spanified function parameter.

## Reason
The rewriter spanified `GLES2DecoderImpl::DoGetTexParameteriv` but it is calling a function `api()->glGetTexParameterivFn` that expects a `GLint*`. The rewriter should have converted the call site to pass the correct type.

## Solution
The rewriter needs to spanify the call sites. In this case, the rewriter needs to change this line:
```c++
api()->glGetTexParameterivFn(target, pname, iparams);
```
to
```c++
api()->glGetTexParameterivFn(target, pname, iparams.data());
```

## Note
The second error has the opposite problem. The rewriter spanified `GLES2DecoderImpl::DoGetTexParameteriv` so the call site should be passing a `base::span<GLint>`, but the type of `params` in the call site is `GLint*`. Rewriter should be able to fix both the definition and the call sites at the same time.
```
../../gpu/command_buffer/service/gles2_cmd_decoder_autogen.h:2018:38: error: no viable conversion from 'GLint *' (aka 'int *') to 'base::span<GLint>' (aka 'span<int>')
 2018 |   DoGetTexParameteriv(target, pname, params, num_values);
      |                                      ^~~~~~