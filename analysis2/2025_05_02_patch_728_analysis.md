# Build Failure Analysis: 2025_05_02_patch_728

## First error

../../gpu/command_buffer/service/gles2_cmd_decoder_autogen.h:4642:36: error: no viable conversion from 'GLuint *' (aka 'unsigned int *') to 'base::span<const GLuint>' (aka 'span<const unsigned int>')
 4642 |       !GenVertexArraysOESHelper(n, arrays_safe)) {
      |                                    ^~~~~~~~~~~

## Category
Pointer passed into spanified function parameter.

## Reason
The function `GenVertexArraysOESHelper` was spanified in `gles2_cmd_decoder.cc`, but the call site in `gles2_cmd_decoder_autogen.h` was not updated to use `base::span`. The error message indicates that the compiler cannot convert a `GLuint*` to a `base::span<const GLuint>`. This means the rewriter failed to update this particular call site. gles2_cmd_decoder_autogen.h is generated code, so it is excluded from the rewriter.

## Solution
Rewriter needs to avoid spanifying functions if it requires spanifying excluded code.

## Note
This is another instance of an excluded file requiring changes.