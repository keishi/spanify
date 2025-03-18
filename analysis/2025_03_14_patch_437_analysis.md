# Build Failure Analysis: 2025_03_14_patch_437

## First error

../../gpu/command_buffer/service/gles2_cmd_decoder_autogen.h:1111:28: error: no viable conversion from 'GLuint *' (aka 'unsigned int *') to 'base::span<const GLuint>' (aka 'span<const unsigned int>')
 1111 |       !GenBuffersHelper(n, buffers_safe)) {
      |                            ^~~~~~~~~~~~

## Category
Rewriter needs to avoid spanifying functions if it requires spanifying excluded code.

## Reason
The rewriter spanified the `GenBuffersHelper` function, but the call site in `gles2_cmd_decoder_autogen.h` is in generated code which should not be modified by the rewriter. The code attempts to pass a `GLuint*` to a function expecting `base::span<const GLuint>`, but the implicit conversion is not valid.

## Solution
The rewriter should not spanify `GenBuffersHelper` because it requires spanifying excluded code.

## Note
The error message indicates the type mismatch between `GLuint*` and `base::span<const GLuint>`.
```
error: no viable conversion from 'GLuint *' (aka 'unsigned int *') to 'base::span<const GLuint>' (aka 'span<const unsigned int>')
```
Also, the file `gles2_cmd_decoder_autogen.h` is auto-generated and should not be modified manually.
```
../../gpu/command_buffer/service/gles2_cmd_decoder_autogen.h
```