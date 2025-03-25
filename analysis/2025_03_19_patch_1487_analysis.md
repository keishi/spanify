# Build Failure Analysis: 2025_03_19_patch_1487

## First error

../../gpu/command_buffer/service/gles2_cmd_decoder_autogen.h:760:31: error: no viable conversion from 'const volatile GLuint *' (aka 'const volatile unsigned int *') to 'base::span<const volatile GLuint>' (aka 'span<const volatile unsigned int>')

## Category
Rewriter needs to avoid spanifying functions if it requires spanifying excluded code.

## Reason
The rewriter is attempting to pass a `const volatile GLuint*` to a function `DeleteFramebuffersHelper` that now expects a `base::span<const volatile GLuint>`. The function `DeleteFramebuffersHelper` exists in `gles2_cmd_decoder.cc`, but it is called from `gles2_cmd_decoder_autogen.h`, which is generated code, and hence excluded. Therefore, the rewriter should not modify `DeleteFramebuffersHelper` to use `base::span`.

## Solution
The rewriter should not modify the signature of `DeleteFramebuffersHelper` to use `base::span`. It should also avoid spanifying functions if it requires spanifying excluded code.

## Note
The error message indicates that there is no viable conversion from `const volatile GLuint*` to `base::span<const volatile GLuint>`. The error occurs in `gles2_cmd_decoder_autogen.h`, which suggests the rewriter is modifying code that should be excluded.