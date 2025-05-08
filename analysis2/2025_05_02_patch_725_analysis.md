# Build Failure Analysis: 2025_05_02_patch_725

## First error

../../gpu/command_buffer/service/gles2_cmd_decoder_autogen.h:1177:34: error: no viable conversion from 'GLuint *' (aka 'unsigned int *') to 'base::span<const GLuint>' (aka 'span<const unsigned int>')
 1177 |       !GenRenderbuffersHelper(n, renderbuffers_safe)) {

## Category
Pointer passed into spanified function parameter.

## Reason
The function `GLES2DecoderImpl::GenRenderbuffersHelper` was spanified to take a `base::span<const GLuint>` as input. However, the call site in `gles2_cmd_decoder_autogen.h` passes a raw `GLuint*`. The rewriter spanified the function, but failed to spanify a call site.

## Solution
The rewriter needs to find all call sites of spanified functions and convert the arguments to spans where necessary. The fix is to update `gles2_cmd_decoder_autogen.h` so that the `renderbuffers_safe` array is passed as a span into `GenRenderbuffersHelper`.

## Note
The code being rewritten is in `gles2_cmd_decoder_autogen.h`, which is generated code. It is possible that this file is auto-generated from other files, and that spanifying the call site needs to happen there. Also, since it is generated code, the rewriter should avoid spanifying the function declaration as described in "Rewriter needs to avoid spanifying functions if it requires spanifying excluded code."