# Build Failure Analysis: 2025_03_19_patch_1500

## First error

../../gpu/command_buffer/service/gles2_cmd_decoder_autogen.h:2747:38: error: no viable conversion from 'const GLint *' (aka 'const int *') to 'base::span<const GLint>' (aka 'span<const int>')
 2747 |   DoShaderSource(shader, count, str, length);
      |                                      ^~~~~~

## Category
Pointer passed into spanified function parameter.

## Reason
The function `GLES2DecoderImpl::DoShaderSource` was spanified, but the call site in `gles2_cmd_decoder_autogen.h` was not updated to pass a `base::span`. The code is passing `const GLint* length` where `base::span<const GLint> length` is expected.

## Solution
The rewriter needs to spanify the call site in `gles2_cmd_decoder_autogen.h` to create a span from the `length` parameter, which is the raw pointer.
```
base::span<const GLint> length(length, count);
DoShaderSource(shader, count, str, length);
```

## Note
This error indicates that the rewriter failed to update a call site when spanifying a function. `gles2_cmd_decoder_autogen.h` is also generated code, and is probably marked as excluded. This probably means that the spanification should not have happened at all.