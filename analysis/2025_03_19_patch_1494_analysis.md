# Build Failure Analysis: 2025_03_19_patch_1494

## First error

../../gpu/command_buffer/service/gles2_cmd_decoder_autogen.h:803:27: error: no viable conversion from 'const volatile GLuint *' (aka 'const volatile unsigned int *') to 'base::span<const volatile GLuint>' (aka 'span<const volatile unsigned int>')

## Category
Rewriter needs to avoid spanifying functions if it requires spanifying excluded code.

## Reason
The function `DeleteSamplersHelper` was spanified to take a `base::span`, but the call site in `gles2_cmd_decoder_autogen.h` (generated code) was not updated to use a span, because generated code is excluded from rewriting. This results in a type mismatch.

## Solution
The rewriter should detect if spanifying a function will require rewriting code that is excluded from rewriting (e.g., generated code), and avoid spanifying the function in that case.

## Note
There is only one error in the build log.