# Build Failure Analysis: 2025_05_02_patch_750

## First error

../../gpu/command_buffer/service/gles2_cmd_decoder_autogen.h:4064:27: error: no viable conversion from 'const volatile GLfloat *' (aka 'const volatile float *') to 'base::span<const volatile GLfloat>' (aka 'span<const volatile float>')
 4064 |   DoVertexAttrib2fv(indx, values);

## Category
Rewriter needs to avoid spanifying functions if it requires spanifying excluded code.

## Reason
The file `gles2_cmd_decoder_autogen.h` is auto-generated, and therefore excluded from spanification. The function `DoVertexAttrib2fv` was spanified, but the call site in `gles2_cmd_decoder_autogen.h` was not. This resulted in a type mismatch. We shouldn't spanify functions that require rewriting excluded code.

## Solution
The rewriter should avoid spanifying functions if it requires spanifying code that is excluded from spanification (e.g., auto-generated code). One solution is to check if there are any call sites within excluded files before spanifying a function.

## Note
The error message indicates that there is no viable conversion from `const volatile GLfloat *` to `base::span<const volatile GLfloat>`.