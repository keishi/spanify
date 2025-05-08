```
# Build Failure Analysis: 2025_05_02_patch_752

## First error

```
../../gpu/command_buffer/service/gles2_cmd_decoder_autogen.h:4137:27: error: no viable conversion from 'const volatile GLfloat *' (aka 'const volatile float *') to 'base::span<const volatile GLfloat>' (aka 'span<const volatile float>')
 4137 |   DoVertexAttrib4fv(indx, values);
      |                           ^~~~~~
```

## Category
Rewriter needs to avoid spanifying functions if it requires spanifying excluded code.

## Reason
The rewriter spanified `GLES2DecoderImpl::DoVertexAttrib4fv`, but failed to spanify `DoVertexAttrib4fv` call sites in `gles2_cmd_decoder_autogen.h`. `gles2_cmd_decoder_autogen.h` is generated code, so it is excluded from the rewriter.

## Solution
The rewriter should not spanify functions that require rewriting excluded code. We should check if the function has any call site inside an excluded file.

## Note
There is only one error.