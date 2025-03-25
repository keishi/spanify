# Build Failure Analysis: 2025_03_19_patch_1496

## First error

../../gpu/command_buffer/service/gles2_cmd_decoder_autogen.h:857:37: error: no viable conversion from 'const volatile GLuint *' (aka 'const volatile unsigned int *') to 'base::span<const volatile GLuint>' (aka 'span<const volatile unsigned int>')

## Category
Rewriter needs to avoid spanifying functions if it requires spanifying excluded code.

## Reason
The function `GLES2DecoderImpl::DeleteTransformFeedbacksHelper` was spanified, but the call site is in `gles2_cmd_decoder_autogen.h` which is auto-generated code and excluded from the rewriter.

## Solution
The rewriter should avoid spanifying functions if it requires spanifying code that is excluded from rewriting (e.g. generated code). This can be achieved by checking if the call site is excluded before spanifying the function.

## Note
The error message indicates that the compiler cannot find a suitable constructor for `base::span<const volatile GLuint>` to convert from `const volatile GLuint*`. This is because the rewriter spanified the function definition but not the call site.