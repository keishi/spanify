# Build Failure Analysis: 2025_03_19_patch_1513

## First error

../../gpu/command_buffer/service/gles2_cmd_decoder_autogen.h:4029:27: error: no viable conversion from 'const volatile GLfloat *' (aka 'const volatile float *') to 'base::span<const volatile GLfloat>' (aka 'span<const volatile float>')

## Category
Rewriter needs to avoid spanifying functions if it requires spanifying excluded code.

## Reason
The function `DoVertexAttrib1fv` was spanified, however, it is being called from `gles2_cmd_decoder_autogen.h`, which is generated code and therefore excluded from rewriting. The compiler is complaining because it cannot convert `const volatile GLfloat*` to `base::span<const volatile GLfloat>`.

## Solution
The rewriter should not spanify functions that are called from excluded code. This can be accomplished by checking if all call sites are spanified before performing the spanification.

## Note
The other functions in the diff might have the same issue.