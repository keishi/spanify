# Build Failure Analysis: 2025_05_02_patch_729

## First error

../../gpu/command_buffer/service/gles2_cmd_decoder_autogen.h:4664:34: error: no viable conversion from 'const volatile GLuint *' (aka 'const volatile unsigned int *') to 'base::span<const volatile GLuint>' (aka 'span<const volatile unsigned int>')

## Category
Rewriter needs to avoid spanifying functions if it requires spanifying excluded code.

## Reason
The function `DeleteVertexArraysOESHelper` in `gles2_cmd_decoder.cc` was spanified, but the call site in `gles2_cmd_decoder_autogen.h` was not. `gles2_cmd_decoder_autogen.h` is generated code and should be excluded from spanification. Therefore, the rewriter should not have spanified `DeleteVertexArraysOESHelper` because it requires rewriting excluded code.

## Solution
The rewriter should not spanify functions if it requires spanifying excluded code.

## Note
The error message indicates that there is no viable conversion from `const volatile GLuint *` to `base::span<const volatile GLuint>`. This is because the code in `gles2_cmd_decoder_autogen.h` is passing a raw pointer to a function that now expects a `base::span`.