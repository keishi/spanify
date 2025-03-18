# Build Failure Analysis: 2025_03_14_patch_439

## First error

../../gpu/command_buffer/service/gles2_cmd_decoder_autogen.h:739:26: error: no viable conversion from 'const volatile GLuint *' (aka 'const volatile unsigned int *') to 'base::span<const volatile GLuint>' (aka 'span<const volatile unsigned int>')

## Category
Rewriter needs to avoid spanifying functions if it requires spanifying excluded code.

## Reason
The function `GLES2DecoderImpl::DeleteBuffersHelper` was spanified, but the call site in `gles2_cmd_decoder_autogen.h` passes a `const volatile GLuint*` which cannot be implicitly converted to `base::span<const volatile GLuint>`. The `gles2_cmd_decoder_autogen.h` file is generated code and therefore should not be modified by the rewriter. The rewriter should have avoided spanifying `GLES2DecoderImpl::DeleteBuffersHelper` because it would require changing generated code.

## Solution
The rewriter should not spanify functions that are called from generated code or other excluded code. The rewriter needs to track the call sites of functions and make sure the spanification only happens if all call sites can be updated.

## Note
The error message is very long, but the key part is the "no viable conversion" error and the fact that it's happening in generated code.
```
../../gpu/command_buffer/service/gles2_cmd_decoder_autogen.h:739:26: error: no viable conversion from 'const volatile GLuint *' (aka 'const volatile unsigned int *') to 'base::span<const volatile GLuint>' (aka 'span<const volatile unsigned int>')"