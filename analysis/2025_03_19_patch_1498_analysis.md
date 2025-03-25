# Build Failure Analysis: 2025_03_19_patch_1498

## First error

../../gpu/command_buffer/service/gles2_cmd_decoder_autogen.h:5019:27: error: no viable conversion from 'const volatile GLenum *' (aka 'const volatile unsigned int *') to 'base::span<const volatile GLenum>' (aka 'span<const volatile unsigned int>')

## Category
Rewriter needs to avoid spanifying functions if it requires spanifying excluded code.

## Reason
The rewriter spanified `GLES2DecoderImpl::DoDrawBuffersEXT`, but the call site is in `gles2_cmd_decoder_autogen.h`, which is generated code and excluded from the rewriter. The rewriter shouldn't be spanifying functions if it would require rewriting excluded code.

## Solution
Revert the spanification of `GLES2DecoderImpl::DoDrawBuffersEXT`.

## Note
There were other errors related to other functions in `gles2_cmd_decoder_autogen.h`. All those errors should be fixed by this single fix.