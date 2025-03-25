# Build Failure Analysis: 2025_03_19_patch_1518

## First error

../../gpu/command_buffer/service/gles2_cmd_decoder_autogen.h:4219:29: error: no viable conversion from 'const volatile GLuint *' (aka 'const volatile unsigned int *') to 'base::span<const volatile GLuint>' (aka 'span<const volatile unsigned int>')

## Category
Rewriter needs to avoid spanifying functions if it requires spanifying excluded code.

## Reason
The rewriter spanified the function `GLES2DecoderImpl::DoVertexAttribI4uiv`. But the call site of the function is in `gles2_cmd_decoder_autogen.h`, which is generated code and excluded from the rewriter. The rewriter shouldn't spanify functions that require rewriting excluded code.

## Solution
The rewriter should avoid spanifying the function `GLES2DecoderImpl::DoVertexAttribI4uiv`.

## Note
There were other errors with the same root cause in this build failure.
```
../../gpu/command_buffer/service/gles2_cmd_decoder_autogen.h:4219:29: error: no viable conversion from 'const volatile GLuint *' (aka 'const volatile unsigned int *') to 'base::span<const volatile GLuint>' (aka 'span<const volatile unsigned int>')
../../gpu/command_buffer/service/gles2_cmd_decoder_autogen.h:4064:27: error: no viable conversion from 'const volatile GLfloat *' (aka 'const volatile float *') to 'base::span<const volatile GLfloat>' (aka 'span<const volatile float>')
../../gpu/command_buffer/service/gles2_cmd_decoder_autogen.h:4010:27: error: no viable conversion from 'const volatile GLfloat *' (aka 'const volatile float *') to 'base::span<const volatile GLfloat>' (aka 'span<const volatile float>')