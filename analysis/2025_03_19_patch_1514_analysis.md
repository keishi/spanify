# Build Failure Analysis: 2025_03_19_patch_1514

## First error

../../gpu/command_buffer/service/gles2_cmd_decoder_autogen.h:4064:27: error: no viable conversion from 'const volatile GLfloat *' (aka 'const volatile float *') to 'base::span<const volatile GLfloat>' (aka 'span<const volatile float>')
4064 |   DoVertexAttrib2fv(indx, values);
      |                           ^~~~~~

## Category
Rewriter needs to avoid spanifying functions if it requires spanifying excluded code.

## Reason
The rewriter spanified the `DoVertexAttrib2fv` function, but the call site in `gles2_cmd_decoder_autogen.h` passes a raw pointer (`const volatile GLfloat*`) to it. `gles2_cmd_decoder_autogen.h` is generated code and therefore excluded from spanification. The rewriter should not spanify functions if spanifying them would require rewriting code in excluded files.

## Solution
The rewriter should be updated to analyze dependency between functions to be rewritten and generated code. If a function needs to be rewritten depends on generated code, it should not be rewritten.

## Note
There are no extra errors.