# Build Failure Analysis: 2025_03_19_patch_622

## First error

../../gpu/command_buffer/client/gles2_implementation_autogen.h:512:31: error: no viable conversion from 'const GLuint *' (aka 'const unsigned int *') to 'base::span<const GLuint>' (aka 'span<const unsigned int>')

## Category
Rewriter failing to recognize raw pointer passed to spanified function.

## Reason
The function `DeleteFramebuffersHelper` was spanified to accept a `base::span<const GLuint>`, but the call site in `gles2_implementation_impl_autogen.h` is passing a raw pointer (`const GLuint* framebuffers`). The rewriter failed to recognize that this is a raw pointer and create a span from it. The generated code is excluded code, which is why the rewriter failed to update it.

## Solution
The rewriter should avoid spanifying functions if it requires spanifying excluded code.

## Note
The file `gles2_implementation_autogen.h` is generated, so it's excluded. We shouldn't be spanifying functions that require rewriting excluded code.