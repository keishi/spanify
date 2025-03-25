# Build Failure Analysis: 2025_03_19_patch_1502

## First error

../../gpu/command_buffer/service/gles2_cmd_decoder_autogen.h:1294:24: error: no viable conversion from 'GLboolean *' (aka 'unsigned char *') to 'base::span<GLboolean>' (aka 'span<unsigned char>')

## Category
Pointer passed into spanified function parameter.

## Reason
The rewriter spanified a function (GLES2DecoderImpl::DoGetBooleanv), but failed to spanify a call site in generated code (gles2_cmd_decoder_autogen.h). The function expects a `base::span<GLboolean>`, but the generated code is still passing a raw `GLboolean*`.

## Solution
The rewriter needs to also update the call sites of the spanified functions.

## Note
The generated code cannot be edited directly, so it is very important to update the call sites. This is an example of a partial spanification.