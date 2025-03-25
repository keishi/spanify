# Build Failure Analysis: 2025_03_19_patch_1490

## First error

../../gpu/command_buffer/service/gles2_cmd_decoder_autogen.h:4546:29: error: no viable conversion from 'const volatile GLuint *' (aka 'const volatile unsigned int *') to 'base::span<const volatile GLuint>' (aka 'span<const volatile unsigned int>')

## Category
Rewriter needs to avoid spanifying functions if it requires spanifying excluded code.

## Reason
The rewriter spanified `GLES2DecoderImpl::DeleteQueriesEXTHelper`, but a call site in `GLES2CmdDecoder::DoDeleteQueriesEXT` (which is in `gles2_cmd_decoder_autogen.h`, a generated file) was not updated. Generated code is excluded from rewriting, so the rewriter should not spanify functions that would require rewriting excluded code.

## Solution
The rewriter should avoid spanifying functions if it requires spanifying excluded code.

## Note
There were no secondary errors.