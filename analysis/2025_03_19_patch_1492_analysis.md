# Build Failure Analysis: 2025_03_19_patch_1492

## First error

../../gpu/command_buffer/service/gles2_cmd_decoder_autogen.h:4664:34: error: no viable conversion from 'const volatile GLuint *' (aka 'const volatile unsigned int *') to 'base::span<const volatile GLuint>' (aka 'span<const volatile unsigned int>')
 4664 |   DeleteVertexArraysOESHelper(n, arrays);
      |                                  ^~~~~~

## Category
Rewriter needs to avoid spanifying functions if it requires spanifying excluded code.

## Reason
The rewriter spanified `DeleteVertexArraysOESHelper`, but failed to spanify the call site in `gles2_cmd_decoder_autogen.h`. This header is generated code, and it is excluded from the rewriter. Rewriting gles2_cmd_decoder_autogen.h is undesired and not intended.

## Solution
The rewriter should not spanify functions if it requires spanifying excluded code.

## Note
The error message says "no viable conversion from 'const volatile GLuint *' to 'base::span<const volatile GLuint>'". This means that the type of the argument `arrays` is `const volatile GLuint *`, and the type of the parameter `client_ids` is `base::span<const volatile GLuint>`. The rewriter should have converted the argument to `base::span<const volatile GLuint>`, but it did not.