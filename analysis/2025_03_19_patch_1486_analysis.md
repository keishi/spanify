# Build Failure Analysis: 2025_03_19_patch_1486

## First error
../../gpu/command_buffer/service/gles2_cmd_decoder_autogen.h:1151:33: error: no viable conversion from 'GLuint *' (aka 'unsigned int *') to 'base::span<const GLuint>' (aka 'span<const unsigned int>')

## Category
Rewriter failing to recognize raw pointer passed to spanified function.

## Reason
The function `GenFramebuffersHelper` was spanified, but a call site in `gles2_cmd_decoder_autogen.h` (a generated file) is passing a raw pointer to it.  The rewriter failed to recognize a size info unavailable rhs value.  Because it is a generated file, spanifying the call site is not desired, so instead the span should not have been added to the function definition.

## Solution
The rewriter should avoid spanifying functions if it requires spanifying excluded code.

## Note
This error occurs because the rewriter should not have attempted to spanify `GenFramebuffersHelper` because it is called in the generated file `gles2_cmd_decoder_autogen.h`.