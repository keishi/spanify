# Build Failure: 2025_05_02_patch_754

## First error

```
../../gpu/command_buffer/service/gles2_cmd_decoder_autogen.h:4219:29: error: no viable conversion from 'const volatile GLuint *' (aka 'const volatile unsigned int *') to 'base::span<const volatile GLuint>' (aka 'span<const volatile unsigned int>')
 4219 |   DoVertexAttribI4uiv(indx, values);
      |                             ^~~~~~
```

## Category
Rewriter needs to avoid spanifying functions if it requires spanifying excluded code.

## Reason
The function `GLES2DecoderImpl::DoVertexAttribI4uiv` was spanified, but the call site in `gles2_cmd_decoder_autogen.h` passes a raw pointer (`const volatile GLuint*`). `gles2_cmd_decoder_autogen.h` is auto-generated code and excluded from spanification. This results in a type mismatch because the rewriter attempted to spanify a function parameter where the call site is in excluded code.

## Solution
The rewriter should avoid spanifying functions if a call site is in excluded code. Specifically, the rewriter should skip functions where spanifying the function signature would require rewriting code in files that are excluded from spanification.

## Note
The error message indicates that there is no viable conversion from `const volatile GLuint *` to `base::span<const volatile GLuint>`. This is because the function `DoVertexAttribI4uiv` was modified to accept a span, but the call site provides a raw pointer.