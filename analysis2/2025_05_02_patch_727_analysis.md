# Build Failure Analysis: 2025_05_02_patch_727

## First error

../../gpu/command_buffer/service/gles2_cmd_decoder_autogen.h:4546:29: error: no viable conversion from 'const volatile GLuint *' (aka 'const volatile unsigned int *') to 'base::span<const volatile GLuint>' (aka 'span<const volatile unsigned int>')

## Category
Rewriter needs to avoid spanifying functions if it requires spanifying excluded code.

## Reason
The function `DeleteQueriesEXTHelper` was spanified.  However, the call site in `gles2_cmd_decoder_autogen.h` passes a `const volatile GLuint*` to it. The `gles2_cmd_decoder_autogen.h` header file is generated code, which the spanify tool excludes. The error message "no viable conversion from 'const volatile GLuint *' to 'base::span<const volatile GLuint>'" indicates that the generated code was not updated to create a span. Because the rewriter doesn't rewrite generated files, it should not spanify this function.

## Solution
The rewriter should avoid spanifying functions if it requires changes to code that is excluded from rewriting (e.g., generated code).  The spanify tool should check if all call sites to a function can be spanified before spanifying the function itself.

## Note
The root cause here is that the call site exists in generated code.