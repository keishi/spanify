# Build Failure Analysis: 2025_03_14_patch_450

## First error

../../gpu/command_buffer/service/gles2_cmd_decoder_autogen.h:857:37: error: no viable conversion from 'const volatile GLuint *' (aka 'const volatile unsigned int *') to 'base::span<const volatile GLuint>' (aka 'span<const volatile unsigned int>').

## Category
Rewriter needs to avoid spanifying functions if it requires spanifying excluded code.

## Reason
The rewriter attempted to spanify `DeleteTransformFeedbacksHelper`, but this function is called in `gles2_cmd_decoder_autogen.h`, which is generated code and therefore excluded from rewriting. The spanified version of `DeleteTransformFeedbacksHelper` expects a `base::span<const volatile GLuint>`, but the call site passes a `const volatile GLuint*`.

## Solution
The rewriter should avoid spanifying functions if it requires spanifying excluded code. In this case, the rewriter should not have attempted to rewrite `DeleteTransformFeedbacksHelper` because it was called from generated code.

## Note
The generated code is at `gpu/command_buffer/service/gles2_cmd_decoder_autogen.h`.