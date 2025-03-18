# Build Failure Analysis: 157

## First error

../../gpu/command_buffer/service/gles2_cmd_decoder_autogen.h:2259:42: error: no viable conversion from 'const volatile GLenum *' (aka 'const volatile unsigned int *') to 'base::span<const volatile GLenum>' (aka 'span<const volatile unsigned int>')

## Category
Rewriter needs to avoid spanifying functions if it requires spanifying excluded code.

## Reason
The rewriter is attempting to convert `const volatile GLenum*` to `base::span<const volatile GLenum>`. However, the error occurs in `gles2_cmd_decoder_autogen.h`, which is a generated file. The rewriter should avoid spanifying functions if it requires spanifying code that is excluded from rewriting. The root cause is that the rewriter touched `gles2_cmd_decoder.cc`, which includes `gles2_cmd_decoder_autogen.h` after the changes, leading to a mismatch between the function definition and function call.

## Solution
The rewriter should avoid spanifying functions if doing so requires changes in excluded code. This could be achieved by checking if a function is defined in generated code and skipping it or verifying that any included headers are safe to modify.

## Note
Similar errors occur in other parts of the generated file, such as line 2312 and 4972. The core issue is the same.
```
../../gpu/command_buffer/service/gles2_cmd_decoder_autogen.h:2312:45: error: no viable conversion from 'const volatile GLenum *' (aka 'const volatile unsigned int *') to 'base::span<const volatile GLenum>' (aka 'span<const volatile unsigned int>')
4972 |   DoDiscardFramebufferEXT(target, count, attachments);