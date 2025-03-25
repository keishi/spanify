# Build Failure Analysis: 2025_03_19_patch_1517

## First error

../../gpu/command_buffer/service/gles2_cmd_decoder_autogen.h:4178:28: error: no viable conversion from 'const volatile GLint *' (aka 'const volatile int *') to 'base::span<const volatile GLint>' (aka 'span<const volatile int>').

## Category
Rewriter needs to avoid spanifying functions if it requires spanifying excluded code.

## Reason
The rewriter spanified `GLES2DecoderImpl::DoVertexAttribI4iv`, but it is called from `gles2_cmd_decoder_autogen.h`, which is generated code. The rewriter is not supposed to modify generated code, but it now has to in order to pass the `base::span` into the function.

## Solution
Rewriter needs to avoid spanifying functions if it requires spanifying excluded code.

## Note
This is the first error, but there may be many more. It is very important to revert the function spanification.