# Build Failure Analysis: 2025_03_19_patch_1484

## First error

../../gpu/command_buffer/service/gles2_cmd_decoder_autogen.h:834:27: error: no viable conversion from 'const volatile GLuint *' (aka 'const volatile unsigned int *') to 'base::span<const volatile GLuint>' (aka 'span<const volatile unsigned int>')

## Category
Rewriter needs to avoid spanifying functions if it requires spanifying excluded code.

## Reason
The rewriter is attempting to pass `textures` to the spanified function `DeleteTexturesHelper`. However, `textures` is a `const volatile GLuint *` which is defined in `gles2_cmd_decoder_autogen.h`. `gles2_cmd_decoder_autogen.h` is auto generated code and is excluded from the rewriter, which is why we are seeing this error. To prevent this from happening, the rewriter should not spanify `DeleteTexturesHelper`.

## Solution
The rewriter should avoid spanifying functions if it requires spanifying excluded code.

## Note
This is an instance of `Rewriter needs to avoid spanifying functions if it requires spanifying excluded code.`