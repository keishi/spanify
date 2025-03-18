```
# Build Failure Analysis: 2025_03_14_patch_1508

## First error

../../gpu/command_buffer/service/gles2_cmd_decoder.cc:8760:27: error: const_cast from 'base::span<const volatile GLfloat>' (aka 'span<const volatile float>') to 'const GLfloat *' (aka 'const float *') is not allowed

## Category
Rewriter needs to avoid spanifying functions if it requires spanifying excluded code.

## Reason
The rewriter is attempting to spanify the `DoUniform4fv` function in `gles2_cmd_decoder.cc`. However, this function is called from code in `gles2_cmd_decoder_autogen.h`, which is generated code and therefore excluded from spanification.  The compiler error arises because the rewriter has changed the function signature to use `base::span`, but the call site in the generated code still passes a raw pointer, leading to a type mismatch.

## Solution
The rewriter should avoid spanifying functions if it requires spanifying excluded code.  Specifically, the rewriter should detect that `DoUniform4fv` is called from `gles2_cmd_decoder_autogen.h`, and therefore should not attempt to spanify it.

## Note
The build log shows that 3 errors are generated. The first error is because of the bad const_cast. The other two errors are due to the call sites passing in raw pointers. These other two errors will be fixed by the fix to not spanify the function.