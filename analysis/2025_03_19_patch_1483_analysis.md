# Build Failure Analysis: 2025_03_19_patch_1483

## First error

../../gpu/command_buffer/service/gles2_cmd_decoder_autogen.h:1111:28: error: no viable conversion from 'GLuint *' (aka 'unsigned int *') to 'base::span<const GLuint>'

## Category
Rewriter failing to recognize raw pointer passed to spanified function.

## Reason
The function `GLES2DecoderImpl::GenBuffersHelper` was spanified, but the call site in `GLES2CmdDecoderImpl::DoGenBuffers` (defined in `gles2_cmd_decoder_autogen.h`) is passing a raw pointer.  The rewriter failed to recognize this size info unavailable rhs value. The rewriter does not know the size of the buffer being passed in at the call site.

## Solution
The rewriter needs to recognize raw pointers passed into spanified functions and handle the case where the size is unavailable.

## Note
The error occurs in `gles2_cmd_decoder_autogen.h`, which is likely generated code. If the rewriter tries to rewrite code inside a generated file, it will result in errors like "Rewriter needs to avoid spanifying functions if it requires spanifying excluded code." The root cause is that the rewriter didn't recognize the raw pointer passed into a spanified function.