# Build Failure Analysis: 2025_03_19_patch_1515

## First error

../../gpu/command_buffer/service/gles2_cmd_decoder_autogen.h:4100:27: error: no viable conversion from 'const volatile GLfloat *' (aka 'const volatile float *') to 'base::span<const volatile GLfloat>' (aka 'span<const volatile float>')
4100 |   DoVertexAttrib3fv(indx, values);
      |                           ^~~~~~

## Category
Rewriter needs to avoid spanifying functions if it requires spanifying excluded code.

## Reason
The function `DoVertexAttrib3fv` was spanified, however the call site in `gles2_cmd_decoder_autogen.h` is generated code, so it is excluded from the rewriter. Thus we shouldn't spanify functions that require rewriting excluded code.

## Solution
Remove the spanification from the function `DoVertexAttrib3fv`. This can be done by reverting this change.

## Note
The error occurs in a generated file (`gles2_cmd_decoder_autogen.h`), which should not be directly modified.