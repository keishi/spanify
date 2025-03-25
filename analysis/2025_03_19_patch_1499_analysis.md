# Build Failure Analysis: 2025_03_19_patch_1499

## First error

../../gpu/command_buffer/service/gles2_cmd_decoder_autogen.h:2747:33: error: no viable conversion from 'const char **' to 'base::span<const char *>'

## Category
Rewriter failing to recognize raw pointer passed to spanified function.

## Reason
The function `GLES2DecoderImpl::DoShaderSource` was spanified. However, the generated code in `gles2_cmd_decoder_autogen.h` still passes `const char**` to `DoShaderSource`. The rewriter likely failed to recognize that `str` is an unavailable size info rhs value.

## Solution
The rewriter needs to correctly handle raw pointers (specifically `const char**` in this case) when calling spanified functions, where the size of the data is not available.

## Note
The error occurs in generated code, so it is important to avoid spanifying functions if it requires spanifying excluded code.