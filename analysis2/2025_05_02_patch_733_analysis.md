# Build Failure Analysis: 2025_05_02_patch_733

## First error

../../gpu/command_buffer/service/gles2_cmd_decoder_autogen.h:857:37: error: no viable conversion from 'const volatile GLuint *' (aka 'const volatile unsigned int *') to 'base::span<const volatile GLuint>' (aka 'span<const volatile unsigned int>')
  857 |   DeleteTransformFeedbacksHelper(n, ids);

## Category
Rewriter needs to avoid spanifying functions if it requires spanifying excluded code.

## Reason
The error message shows that the compiler couldn't convert `const volatile GLuint*` to `base::span<const volatile GLuint>`. The function `DeleteTransformFeedbacksHelper` in `gles2_cmd_decoder.cc` was spanified, but the call site in `gles2_cmd_decoder_autogen.h` wasn't updated. `gles2_cmd_decoder_autogen.h` is generated code. Thus we shouldn't spanify functions that require rewriting excluded code.

## Solution
The rewriter should avoid spanifying functions if it requires spanifying excluded code.

## Note
NA