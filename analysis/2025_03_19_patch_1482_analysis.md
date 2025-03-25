# Build Failure Analysis: 2025_03_19_patch_1482

## First error

../../gpu/command_buffer/service/gles2_cmd_decoder.cc:16182:40: error: no matching conversion for functional-style cast from 'GLuint *' (aka 'unsigned int *') to 'base::span<GLuint, 1>' (aka 'span<unsigned int, 1>')

## Category
Rewriter failing to recognize raw pointer passed to spanified function.

## Reason
The `GenTexturesHelper` function was spanified, but the call site is passing a raw pointer `&client_id`. Rewriter failed to recognize a size info available rhs value and failed to create a span from that pointer.

## Solution
The rewriter should construct a `base::span` object when a raw pointer is passed to a spanified function.

## Note

The second error is similar to the first, just in a different file.